import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";
import { internal } from "./_generated/api";
import { getUserIdentity, requireRole } from "./utils/auth";
import { ROLES } from "./utils/constants";

type Team = Doc<"teams">;

type PopulatedTeam = Team & {
  memberIds: Doc<"users">["_id"][];
  teamLead: Doc<"users"> | null;
  projectIds: Doc<"projects">["_id"][];
};

type TeamProject = Doc<"team_projects"> & {
  project: Doc<"projects">;
  productManager: Doc<"users"> | null;
};

export const getTeams = query({
  args: {
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<PopulatedTeam[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, [
      "CTO",
      "Product Manager",
    ]);
    if (identityError) return { data: null, error: identityError };

    const query = ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("accountId"), account._id));

    // if (identity.role === "Product Manager") {
    //   query = query.filter((q) =>
    //     q.eq(q.field("productManagerId"), identity.convexUserId)
    //   );
    // } // TODO: Add filtering by Product Manager

    const teams = await query.collect();
    const teamsWithMembers = (
      await Promise.allSettled(
        teams.map(async (team) => ({
          ...team,
          memberIds: (
            await ctx.db
              .query("team_members")
              .filter((q) => q.eq(q.field("teamId"), team._id))
              .collect()
          ).map((member) => member.userId),
          projectIds: (
            await ctx.db
              .query("team_projects")
              .filter((q) => q.eq(q.field("team_id"), team._id))
              .filter((q) => q.eq(q.field("unassigned_at"), undefined))
              .collect()
          ).map((project) => project.project_id),
          teamLead: team.team_lead_id
            ? await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("_id"), team.team_lead_id))
                .unique()
            : null,
        }))
      )
    )
      .map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return null;
      })
      .filter((team) => team !== null);

    return { data: teamsWithMembers, error: null };
  },
});

export const getTeamBySlug = query({
  args: {
    accountToken: v.string(),
    teamSlug: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<PopulatedTeam, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO", "Product Manager"]))
      .error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const team = await ctx.db
      .query("teams")
      .filter((q) => q.or(
        q.eq(q.field("slug"), args.teamSlug),
        q.eq(q.field("previous_slug"), args.teamSlug)
      ))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();

    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    const teamMembers = await ctx.db
      .query("team_members")
      .filter((q) => q.eq(q.field("teamId"), team._id))
      .collect();

    const teamProjects = await ctx.db
      .query("team_projects")
      .filter((q) => q.eq(q.field("team_id"), team._id))
      .filter((q) => q.eq(q.field("unassigned_at"), undefined))
      .collect();

    const teamLead = team.team_lead_id
      ? await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), team.team_lead_id))
          .unique()
      : null;

    const populatedTeam = {
      ...team,
      memberIds: teamMembers.map((member) => member.userId),
      projectIds: teamProjects.map((project) => project.project_id),
      teamLead,
    };

    return { data: populatedTeam, error: null };
  },
});

export const getTeamMembers = query({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (
    ctx,
    args
  ): Result<
    (Doc<"team_members"> & { user: Doc<"users"> })[],
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND"
  > => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    const { data: identity, error: identityError } = await getUserIdentity(ctx);
    if (identityError) {
      return { data: null, error: identityError };
    }

    const teamMembers = await ctx.db
      .query("team_members")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    const isNormalUser = !["CTO", "Product Manager"].includes(
      identity.role as (typeof ROLES)[number]
    );
    const isTeamMember = teamMembers
      .map((member) => member.userId)
      .includes(identity.convexUserId as Id<"users">);

    if (isNormalUser && !isTeamMember) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    const teamMembersWithUsers = (
      await Promise.allSettled(
        teamMembers.map(async (member) => ({
          ...member,
          user: await ctx.db.get("users", member.userId),
        }))
      )
    )
      .map((result) => {
        if (result.status === "fulfilled") {
          if (result.value.user === null) {
            return null;
          }
          return result.value;
        }
        return null;
      })
      .filter((member) => member !== null) as (Doc<"team_members"> & {
      user: Doc<"users">;
    })[];

    return { data: teamMembersWithUsers, error: null };
  },
});

export const getTeamProjects = query({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (
    ctx,
    args
  ): Result<
    TeamProject[],
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND"
  > => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    const { data: identity, error: identityError } = await getUserIdentity(ctx);
    if (identityError) {
      return { data: null, error: identityError };
    }

    const teamMembers = await ctx.db
      .query("team_members")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    const isNormalUser = !["CTO", "Product Manager"].includes(
      identity.role as (typeof ROLES)[number]
    );
    const isTeamMember = teamMembers
      .map((member) => member.userId)
      .includes(identity.convexUserId as Id<"users">);

    if (isNormalUser && !isTeamMember) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    const teamProjects = await ctx.db
      .query("team_projects")
      .filter((q) => q.eq(q.field("team_id"), args.teamId))
      .filter((q) => q.eq(q.field("unassigned_at"), undefined))
      .collect();

    const teamProjectsWithProjects = (
      await Promise.allSettled(
        teamProjects.map(async (teamProject) => {
          const project = await ctx.db.get(teamProject.project_id);
          if (!project) return null;

          const productManager = project.productManagerId
            ? await ctx.db.get(project.productManagerId)
            : null;

          return {
            ...teamProject,
            project,
            productManager,
          };
        })
      )
    )
      .map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return null;
      })
      .filter((project) => project !== null) as (Doc<"team_projects"> & {
      project: Doc<"projects">;
      productManager: Doc<"users"> | null;
    })[];

    return { data: teamProjectsWithProjects, error: null };
  },
});

export const getTeamsProjects = query({
  args: {
    teamsIds: v.array(v.id("teams")),
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<
    Record<Id<"teams">, TeamProject[]>,
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND"
  > => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO", "Product Manager"]))
      .error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const teamsProjects: Record<Id<"teams">, TeamProject[]> = {};

    for (const teamId of args.teamsIds) {
      const team = await ctx.db
        .query("teams")
        .filter((q) => q.eq(q.field("_id"), teamId))
        .filter((q) => q.eq(q.field("accountId"), account._id))
        .unique();
      if (!team) {
        return { data: null, error: "TEAM_NOT_FOUND" };
      }

      const teamProjects = await ctx.db
        .query("team_projects")
        .filter((q) => q.eq(q.field("team_id"), teamId))
        .filter((q) => q.eq(q.field("unassigned_at"), undefined))
        .collect();

      const teamProjectsWithProjects = (
        await Promise.allSettled(
          teamProjects.map(async (teamProject) => {
            const project = await ctx.db.get(teamProject.project_id);
            if (!project) return null;

            const productManager = project.productManagerId
              ? await ctx.db.get(project.productManagerId)
              : null;

            return {
              ...teamProject,
              project,
              productManager,
            };
          })
        )
      )
        .map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          }
          return null;
        })
        .filter((project) => project !== null) as (Doc<"team_projects"> & {
        project: Doc<"projects">;
        productManager: Doc<"users"> | null;
      })[];

      teamsProjects[teamId] = teamProjectsWithProjects;
    }

    return { data: teamsProjects, error: null };
  },
});

export const createTeam = mutation({
  args: {
    accountToken: v.string(),
    team: v.object({
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      membersIds: v.array(v.id("users")),
      teamLeadId: v.optional(v.id("users")),
    }),
  },
  handler: async (
    ctx,
    args
  ): Result<
    Pick<Doc<"teams">, "name" | "slug"> & { _id: Id<"teams"> },
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_ALREADY_EXISTS"
  > => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const existingTeam = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .filter((q) =>
        q.or(q.eq(q.field("slug"), args.team.slug), q.eq(q.field("name"), args.team.name))
      )
      .first();
    if (existingTeam) {
      return { data: null, error: "TEAM_ALREADY_EXISTS" };
    }

    const newTeam = {
      name: args.team.name,
      description: args.team.description,
      slug: args.team.slug,
      team_lead_id: args.team.teamLeadId ?? undefined,
      accountId: account._id,
      updatedAt: Date.now(),
    };
    const teamId = await ctx.db.insert("teams", newTeam);

    await Promise.all(
      args.team.membersIds.map(async (memberId) => {
        ctx.db.insert("team_members", {
          teamId,
          userId: memberId,
          role: memberId === args.team.teamLeadId ? "team_lead" : "member",
          is_primary: false, // TODO: Add primary member logic
          updatedAt: Date.now(),
        });
      })
    );

    return {
      data: { _id: teamId, name: args.team.name, slug: args.team.slug },
      error: null,
    };
  },
});

export const updateTeam = mutation({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
    team: v.object({
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      teamLeadId: v.optional(v.id("users")),
    }),
  },
  handler: async (
    ctx,
    args
  ): Result<void, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND" | "TEAM_LEAD_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }

    if (args.team.teamLeadId) {
      const existingTeamLead = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), args.team.teamLeadId))
        .filter((q) => q.eq(q.field("accountId"), account._id))
        .unique();
      if (!existingTeamLead) {
        return { data: null, error: "TEAM_LEAD_NOT_FOUND" };
      }
    }

    await ctx.db.patch(team._id, {
      name: args.team.name,
      description: args.team.description,
      slug: args.team.slug,
      previous_slug: team.slug !== args.team.slug ? team.slug : team.previous_slug,
      team_lead_id: args.team.teamLeadId,
      updatedAt: Date.now(),
    });

    return { data: undefined, error: null };
  },
});

export const removeTeamMember = mutation({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (
    ctx,
    args
  ): Result<void, "NOT_AUTHENTICATED"| "NOT_AUTHORIZED"| "TEAM_NOT_FOUND"| "USER_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }

    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }
    const teamMember = await ctx.db
      .query("team_members")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique();
    if (!teamMember) {
      return { data: null, error: "USER_NOT_FOUND" };
    }
    await ctx.db.delete(teamMember._id);
    return { data: undefined, error: null };
  },
});

export const changeTeamLead = mutation({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
    teamLeadId: v.optional(v.id("users")),
  },
  handler: async (
    ctx,
    args
  ): Result<void, "NOT_AUTHENTICATED"| "NOT_AUTHORIZED"| "TEAM_NOT_FOUND"| "USER_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }
    const identityError = (await requireRole(ctx, ["CTO"])).error;
    if (identityError) {
      return { data: null, error: identityError };
    }
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }
    if (args.teamLeadId) {
      const existingTeamLead = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), args.teamLeadId))
        .filter((q) => q.eq(q.field("accountId"), account._id))
        .unique();
      if (!existingTeamLead) {
        return { data: null, error: "USER_NOT_FOUND" };
      }
    }

    await ctx.db.patch(team._id, {
      team_lead_id: args.teamLeadId,
      updatedAt: Date.now(),
    });

    return { data: undefined, error: null };
  },
});

export const assignTeamsToProject = mutation({
  args: {
    teamsIds: v.array(v.id("teams")),
    projectId: v.id("projects"),
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<
    void,
    | "NOT_AUTHENTICATED"
    | "NOT_AUTHORIZED"
    | "TEAM_NOT_FOUND"
    | "PROJECT_NOT_FOUND"
  > => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, [
      "CTO",
      "Product Manager",
    ]);
    if (identityError) {
      return { data: null, error: identityError };
    }

    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("_id"), args.projectId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!project) {
      return { data: null, error: "PROJECT_NOT_FOUND" };
    }
    if (
      identity.role === "Product Manager" &&
      project.productManagerId !== identity.convexUserId
    ) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }

    await Promise.all(
      args.teamsIds.map(async (teamId) => {
        const team = await ctx.db
          .query("teams")
          .filter((q) => q.eq(q.field("_id"), teamId))
          .filter((q) => q.eq(q.field("accountId"), account._id))
          .unique();
        if (!team) {
          return;
        }

        const alreadyAssigned = await ctx.db
          .query("team_projects")
          .filter((q) => q.eq(q.field("team_id"), teamId))
          .filter((q) => q.eq(q.field("project_id"), args.projectId))
          .filter((q) => q.eq(q.field("unassigned_at"), undefined))
          .unique();
        if (alreadyAssigned) {
          return;
        }

        ctx.db.insert("team_projects", {
          team_id: teamId,
          project_id: args.projectId,
          assigned_at: Date.now(),
          assigned_by: identity.convexUserId,
          updated_at: Date.now(),
        });
      })
    );

    return { data: undefined, error: null };
  },
});

export const unassignTeamsFromProject = mutation({
  args: {
    teamsIds: v.array(v.id("teams")),
    projectId: v.id("projects"),
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<void, "NOT_AUTHENTICATED"| "NOT_AUTHORIZED"| "TEAM_NOT_FOUND"| "PROJECT_NOT_FOUND"| "ASSIGNMENT_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, [
      "CTO",
      "Product Manager",
    ]);
    if (identityError) {
      return { data: null, error: identityError };
    }

    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("_id"), args.projectId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!project) {
      return { data: null, error: "PROJECT_NOT_FOUND" };
    }
    if (
      identity.role === "Product Manager" &&
      project.productManagerId !== identity.convexUserId
    ) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }

    await Promise.all(
      args.teamsIds.map(async (teamId) => {
        const team = await ctx.db
          .query("teams")
          .filter((q) => q.eq(q.field("_id"), teamId))
          .filter((q) => q.eq(q.field("accountId"), account._id))
          .unique();
        if (!team) {
          return;
        }

        const teamProject = await ctx.db
          .query("team_projects")
          .filter((q) => q.eq(q.field("team_id"), teamId))
          .filter((q) => q.eq(q.field("project_id"), args.projectId))
          .filter((q) => q.eq(q.field("unassigned_at"), undefined))
          .unique();

        if (!teamProject) {
          return;
        }

        await ctx.db.patch(teamProject._id, {
          unassigned_at: Date.now(),
          unassigned_by: identity.convexUserId,
          updated_at: Date.now(),
        });
      })
    );

    return { data: undefined, error: null };
  },
});
