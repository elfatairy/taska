import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./utils/auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
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
