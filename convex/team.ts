import { v } from "convex/values";
import { ActionCtx, internalMutation, internalQuery, mutation, query } from "./_generated/server";
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
  ): Result<
    PopulatedTeam,
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

    const team = await ctx.db
      .query("teams")
      .filter((q) =>
        q.or(
          q.eq(q.field("slug"), args.teamSlug),
          q.eq(q.field("previous_slug"), args.teamSlug)
        )
      )
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
          let projectQuery = ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("_id"), teamProject.project_id));
            
          if (identity.role === "Product Manager") {
            projectQuery = projectQuery.filter((q) =>
              q.eq(q.field("productManagerId"), identity.convexUserId)
            );
          }
          const project = await projectQuery.unique();

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
        q.or(
          q.eq(q.field("slug"), args.team.slug),
          q.eq(q.field("name"), args.team.name)
        )
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
  ): Result<
    void,
    | "NOT_AUTHENTICATED"
    | "NOT_AUTHORIZED"
    | "TEAM_NOT_FOUND"
    | "TEAM_LEAD_NOT_FOUND"
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
      previous_slug:
        team.slug !== args.team.slug ? team.slug : team.previous_slug,
      team_lead_id: args.team.teamLeadId,
      updatedAt: Date.now(),
    });

    return { data: undefined, error: null };
  },
});

export const assignMembersToTeam = mutation({
  args: {
    accountToken: v.string(),
    teamId: v.id("teams"),
    membersIds: v.array(v.id("users")),
  },
  handler: async (
    ctx,
    args
  ): Result<
    void,
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND" | "USER_NOT_FOUND"
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
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("_id"), args.teamId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!team) {
      return { data: null, error: "TEAM_NOT_FOUND" };
    }
    await Promise.all(
      args.membersIds.map(async (memberId) => {
        const existingMember = await ctx.db
          .query("team_members")
          .filter((q) => q.eq(q.field("teamId"), args.teamId))
          .filter((q) => q.eq(q.field("userId"), memberId))
          .unique();
        if (existingMember) {
          return;
        }
        ctx.db.insert("team_members", {
          teamId: args.teamId,
          userId: memberId,
          role: "member",
          is_primary: false,
          updatedAt: Date.now(),
        });
      })
    );
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
  ): Result<
    void,
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND" | "USER_NOT_FOUND"
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
    if (teamMember.role === "team_lead") {
      await ctx.db.patch(team._id, {
        team_lead_id: undefined,
        updatedAt: Date.now(),
      });
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
  ): Result<
    void,
    "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "TEAM_NOT_FOUND" | "USER_NOT_FOUND"
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

    const oldTeamLeadId = team.team_lead_id;
    if (oldTeamLeadId) {
      const oldTeamLeadMember = await ctx.db
        .query("team_members")
        .filter((q) => q.eq(q.field("teamId"), args.teamId))
        .filter((q) => q.eq(q.field("userId"), oldTeamLeadId))
        .unique();

      if (oldTeamLeadMember) {
        await ctx.db.patch(oldTeamLeadMember._id, {
          role: "member",
          updatedAt: Date.now(),
        });
      }
    }

    if (args.teamLeadId) {
      const newTeamLeadMember = await ctx.db
        .query("team_members")
        .filter((q) => q.eq(q.field("teamId"), args.teamId))
        .filter((q) => q.eq(q.field("userId"), args.teamLeadId))
        .unique();

      if (newTeamLeadMember) {
        await ctx.db.patch(newTeamLeadMember._id, {
          role: "team_lead",
          updatedAt: Date.now(),
        });
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

// TODO: handle if sprint still running
export const unassignTeamsFromProject = mutation({
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
    | "ASSIGNMENT_NOT_FOUND"
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

export const getTeamsByAccountId = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Result<Doc<"teams">[]> => {
    const teams = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();
    return { data: teams, error: null };
  }
});

export const getTeamMembersByTeamId = internalQuery({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args): Result<Doc<"users">[]> => {
    const teamMembers = await ctx.db
      .query("team_members")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
    
    const users = await Promise.all(
      teamMembers.map(async (member) => {
        return await ctx.db.get(member.userId);
      })
    );

    return { data: users.filter((u) => u !== null) as Doc<"users">[], error: null };
  }
});

export const initializeTeams = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
): Result<{ demoTeamLeadId: Doc<"users">["_id"] }, "NO_USERS_FOUND"> => {
  const now = Date.now();

  // Get users to assign as team leads and members
  const allUsersResult = await ctx.runQuery(internal.user.getUsersByAccountId, {
    accountId: accountId,
  });
  if (allUsersResult.error || !allUsersResult.data?.length) {
    return { data: null, error: "NO_USERS_FOUND" };
  }

  const allUsers = allUsersResult.data;
  const developers = allUsers.filter(u => 
    u.role === "Frontend Developer" || u.role === "Backend Developer"
  );
  const designers = allUsers.filter(u => u.role === "Designer");
  const qaEngineers = allUsers.filter(u => u.role === "QA");
  const devOps = allUsers.filter(u => u.role === "DevOps");

  // Helper to get random users
  const getRandomUsers = (users: typeof allUsers, count: number) => {
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, users.length));
  };

  const initialTeams = [
    {
      name: "Alpha Squad",
      description: "Full-stack development team focused on building core product features with expertise in React, Node.js, and mobile technologies. This team handles end-to-end feature development from frontend to backend.",
      slug: "alpha-squad",
      team_lead_id: developers[0]?._id,
      members: getRandomUsers([...developers, ...designers], 4).map(u => u._id),
    },
    {
      name: "Beta Team",
      description: "Specialized team dedicated to user experience, design systems, and frontend development. They focus on creating beautiful, accessible, and performant user interfaces across web and mobile platforms.",
      slug: "beta-team",
      team_lead_id: designers[0]?._id || developers[1]?._id,
      members: getRandomUsers([...designers, ...developers], 4).map(u => u._id),
    },
    {
      name: "Gamma Force",
      description: "Backend and infrastructure team responsible for API development, database optimization, microservices architecture, and cloud infrastructure. They ensure scalability, reliability, and performance of all backend services.",
      slug: "gamma-force",
      team_lead_id: developers[2]?._id || developers[0]?._id,
      members: getRandomUsers([...developers, ...devOps], 4).map(u => u._id),
    },
    {
      name: "QA Warriors",
      description: "Quality assurance team ensuring product excellence through comprehensive testing strategies including automated testing, manual testing, performance testing, and security testing. They maintain high quality standards across all releases.",
      slug: "qa-warriors",
      team_lead_id: qaEngineers[0]?._id || developers[0]?._id,
      members: getRandomUsers([...qaEngineers, ...developers], 3).map(u => u._id),
    },
  ];

  for (const team of initialTeams) {
    const newTeam = {
      name: team.name,
      description: team.description,
      slug: team.slug,
      team_lead_id: team.team_lead_id,
      accountId: accountId,
      updatedAt: now,
    } satisfies Omit<Doc<"teams">, "_id" | "_creationTime" | "previous_slug">;

    await ctx.runMutation(internal.team.createTeamService, {
      team: newTeam,
      members: team.members,
    });
  }

  return { data: {
    demoTeamLeadId: developers[0]?._id,
  }, error: null };
};

export const createTeamService = internalMutation({
  args: {
    team: v.object({
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      team_lead_id: v.optional(v.id("users")),
      accountId: v.id("accounts"),
      updatedAt: v.number(),
    }),
    members: v.array(v.id("users")),
  },
  handler: async (ctx, args): Promise<Id<"teams">> => {
    const teamId = await ctx.db.insert("teams", args.team);
    
    // Insert team members
    await Promise.all(
      args.members.map(async (memberId) => {
        await ctx.db.insert("team_members", {
          teamId,
          userId: memberId,
          role: memberId === args.team.team_lead_id ? "team_lead" : "member",
          is_primary: false,
          updatedAt: Date.now(),
        });
      })
    );

    return teamId;
  }
});
