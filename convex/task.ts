import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { Result } from "./utils/types";
import { internal } from "./_generated/api";
import { requireRole } from "./utils/auth";
import { vTaskPriority, vTaskStatus } from "./schema";

export const createTask = mutation({
  args: {
    accountToken: v.string(),
    projectId: v.id("projects"),
    teamId: v.id("teams"),
    title: v.string(),
    description: v.string(),
    status: vTaskStatus,
    acceptanceCriteria: v.optional(v.string()),
    estimate: v.optional(v.number()),
    priority: v.optional(vTaskPriority),
  },
  handler: async (
    ctx,
    args
  ): Result<{ taskId: Id<"tasks"> }, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND" | "TEAM_NOT_FOUND" | "TEAM_NOT_ASSIGNED_TO_PROJECT"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    // TODO: allow team lead to create tasks
    const { data: identity, error: identityError } = await requireRole(ctx, ["Product Manager"]);
    if (identityError) return { data: null, error: identityError };

    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("_id"), args.projectId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .filter((q) => q.eq(q.field("productManagerId"), identity.convexUserId))
      .unique();
    if (!project) return { data: null, error: "PROJECT_NOT_FOUND" };

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

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      project_id: args.projectId,
      team_id: args.teamId,
      title: args.title,
      description: args.description,
      acceptance_criteria: args.acceptanceCriteria,
      status: args.status,
      priority: args.priority,
      estimate: args.estimate,
      carry_over_count: 0,
      created_by: identity.convexUserId,
      created_at: now,
      updated_at: now,
      unplanned: false,
    });

    return { data: { taskId }, error: null };
  },
});
