import { v } from "convex/values";
import { ActionCtx, internalMutation, internalQuery, mutation } from "./_generated/server";
import { requireRole } from "./utils/auth";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";

export const createSprint = mutation({
  args: {
    accountToken: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    teamId: v.id("teams"),
    start_date: v.number(),
    end_date: v.number(),
    goal: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<{ sprintId: Id<"sprints"> }, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND" | "TEAM_NOT_FOUND" | "INVALID_DATE_RANGE" | "TEAM_NOT_ASSIGNED_TO_PROJECT" | "OVERLAPPING_SPRINT"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, ["Product Manager"]);
    if (identityError) {
      return { data: null, error: identityError };
    }

    // Verify project exists and user has access
    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("_id"), args.projectId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!project) {
      return { data: null, error: "PROJECT_NOT_FOUND" };
    }

    if (identity.role === "Product Manager" && project.productManagerId !== identity.convexUserId) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) return { data: null, error: "TEAM_NOT_FOUND" };


    const teamProject = await ctx.db
      .query("team_projects")
      .filter((q) => q.eq(q.field("team_id"), args.teamId))
      .filter((q) => q.eq(q.field("project_id"), args.projectId))
      .filter((q) => q.eq(q.field("unassigned_at"), undefined))
      .unique();
    if (!teamProject) return { data: null, error: "TEAM_NOT_ASSIGNED_TO_PROJECT" };

    // Validate date range
    if (args.start_date >= args.end_date) {
      return { data: null, error: "INVALID_DATE_RANGE" };
    }

    const now = Date.now();

    // Check for overlapping sprints for the same team and project
    const existingSprints = await ctx.db
      .query("sprints")
      .filter((q) => q.eq(q.field("project_id"), args.projectId))
      .filter((q) => q.eq(q.field("team_id"), args.teamId))
      .collect();

    const hasOverlap = existingSprints.some((sprint) => {
      // Skip canceled or completed sprints
      if (sprint.status === "CANCELED" || sprint.status === "COMPLETED") {
        return false;
      }
      
      // Check if the new sprint overlaps with existing sprint
      // Overlap occurs if: new_start < existing_end AND new_end > existing_start
      return args.start_date < sprint.end_date && args.end_date > sprint.start_date;
    });

    if (hasOverlap) {
      return { data: null, error: "OVERLAPPING_SPRINT" };
    }

    const newSprint = {
      project_id: args.projectId,
      team_id: args.teamId,
      name: args.name,
      goal: args.goal,
      status: "PLANNED" as const,
      start_date: args.start_date,
      end_date: args.end_date,
      created_by: identity.convexUserId,
      created_at: now,
      updated_at: now
    }

    const sprintId = await ctx.db.insert("sprints", newSprint);

    return {
      data: {
        sprintId,
      },
      error: null,
    };
  },
});

export const initializeSprints = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
): Result<void, "NO_PROJECTS_FOUND" | "NO_TEAMS_FOUND" | "NO_USERS_FOUND"> => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const twoWeeks = 14 * oneDay;

  // Get projects
  const projectsResult = await ctx.runQuery(internal.project.getProjectsByAccountId, {
    accountId: accountId,
  });
  if (projectsResult.error || !projectsResult.data?.length) {
    return { data: null, error: "NO_PROJECTS_FOUND" };
  }
  const projects = projectsResult.data;

  // Get teams
  const teamsResult = await ctx.runQuery(internal.team.getTeamsByAccountId, {
    accountId: accountId,
  });
  if (teamsResult.error || !teamsResult.data?.length) {
    return { data: null, error: "NO_TEAMS_FOUND" };
  }
  const teams = teamsResult.data;

  // Get product managers to use as created_by
  const productManagersResult = await ctx.runQuery(internal.user.getUsersByAccountId, {
    accountId: accountId,
    role: "Product Manager",
  });
  if (productManagersResult.error || !productManagersResult.data?.length) {
    return { data: null, error: "NO_USERS_FOUND" };
  }
  const productManagers = productManagersResult.data;

  // Assign teams to projects and create sprints
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const assignedTeams = teams.slice(i % teams.length, (i % teams.length) + 2); // Assign 1-2 teams per project
    
    for (const team of assignedTeams) {
      // Create team_project assignment
      await ctx.runMutation(internal.project.assignTeamToProjectService, {
        teamId: team._id,
        projectId: project._id,
        assignedBy: project.productManagerId || productManagers[0]._id,
      });

      // Create sprints for this team-project combination
      const projectStartDate = project.start_date || now;
      const sprintGoals = [
        "Foundation and Architecture - Set up project infrastructure, establish coding standards, and implement core authentication and authorization systems",
        "Core Features Development - Build primary user-facing features, implement main workflows, and establish database schemas and API endpoints",
        "Enhancement and Integration - Integrate third-party services, add advanced features, implement real-time updates and notifications",
        "Polish and Optimization - UI/UX refinements, performance optimization, bug fixes, and preparation for production deployment",
      ];

      for (let sprintNum = 0; sprintNum < 3; sprintNum++) {
        const sprintStart = projectStartDate + (sprintNum * twoWeeks);
        const sprintEnd = sprintStart + twoWeeks;
        
        let status: "PLANNED" | "READY" | "ACTIVE" | "COMPLETED" | "CANCELED" = "PLANNED";
        if (sprintStart < now && sprintEnd > now) {
          status = "ACTIVE";
        } else if (sprintEnd < now) {
          status = "COMPLETED";
        } else if (sprintStart - now < (7 * oneDay)) {
          status = "READY";
        }

        await ctx.runMutation(internal.sprint.createSprintService, {
          sprint: {
            project_id: project._id,
            team_id: team._id,
            name: `Sprint ${sprintNum + 1}`,
            goal: sprintGoals[sprintNum] || "Continue development and deliver planned features",
            status: status,
            start_date: sprintStart,
            end_date: sprintEnd,
            created_by: project.productManagerId || productManagers[0]._id,
            created_at: now,
            updated_at: now,
            started_at: status === "ACTIVE" || status === "COMPLETED" ? sprintStart : undefined,
            completed_at: status === "COMPLETED" ? sprintEnd : undefined,
          }
        });
      }
    }
  }

  return { data: undefined, error: null };
};

export const createSprintService = internalMutation({
  args: {
    sprint: v.object({
      project_id: v.id("projects"),
      team_id: v.id("teams"),
      name: v.string(),
      goal: v.string(),
      status: v.union(
        v.literal("PLANNED"),
        v.literal("READY"),
        v.literal("ACTIVE"),
        v.literal("COMPLETED"),
        v.literal("CANCELED"),
      ),
      start_date: v.number(),
      end_date: v.number(),
      created_by: v.id("users"),
      created_at: v.number(),
      updated_at: v.number(),
      started_at: v.optional(v.number()),
      completed_at: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"sprints">> => {
    const sprintId = await ctx.db.insert("sprints", args.sprint);
    return sprintId;
  }
});

export const getSprintsByAccountId = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Result<Doc<"sprints">[]> => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();
    
    const projectIds = projects.map(p => p._id);
    const sprints: Doc<"sprints">[] = [];
    
    for (const projectId of projectIds) {
      const projectSprints = await ctx.db
        .query("sprints")
        .filter((q) => q.eq(q.field("project_id"), projectId))
        .collect();
      sprints.push(...projectSprints);
    }

    return { data: sprints, error: null };
  }
});
