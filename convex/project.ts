import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireRole } from "./utils/auth";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";

export const getProjectsByAccountId = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Result<Doc<"projects">[]> => {
    const projects = await ctx.db.query("projects").filter((q) => q.eq(q.field("accountId"), args.accountId)).collect();
    return { data: projects, error: null };
  }
})

export const createProject = mutation({
  args: {
    accountToken: v.string(),
    project: v.object({
      name: v.string(),
      description: v.string(),
      productManagerId: v.id("users"),
      key: v.string(),
      slug: v.string(),
      start_date: v.optional(v.number()),
      target_date: v.optional(v.number()),
    }),
  },
  handler: async (
    ctx,
    args
  ): Result<{ projectId: Id<"projects">; projectName: string; projectSlug: string }, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
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

    const projectStarted = args.project.start_date
      ? Date.now() >= args.project.start_date
      : false;

    const newProject = {
      name: args.project.name,
      description: args.project.description,
      productManagerId: args.project.productManagerId,
      key: args.project.key,
      slug: args.project.slug,
      accountId: account._id,
      updatedAt: Date.now(),
      status: projectStarted ? "in_progress" : "draft",
      is_archived: false,
      color: "#000000",
      icon: "",
      start_date: args.project.start_date ? Date.now() : undefined,
      target_date: args.project.target_date ? Date.now() : undefined,
      completed_date: undefined,
    } satisfies Omit<Doc<"projects">, "_id" | "_creationTime">;

    const projectId = await ctx.db.insert("projects", newProject);
    return {
      data: {
        projectId,
        projectName: newProject.name,
        projectSlug: newProject.slug,
      },
      error: null,
    };
  },
});

export const getProjects = query({
  args: {
    accountToken: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Result<Doc<"projects">[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
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

    let query = ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("accountId"), account._id));

    if (identity.role === "Product Manager") {
      query = query.filter((q) =>
        q.eq(q.field("productManagerId"), identity.convexUserId)
      );
    }

    const projects = await query.collect();
    return { data: projects, error: null };
  },
});

export const deleteProject = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args): Result<void> => {
    await ctx.db.delete(args.projectId);
    return { data: undefined, error: null };
  }
})