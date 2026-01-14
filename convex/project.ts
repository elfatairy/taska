import { v } from "convex/values";
import { ActionCtx, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireRole } from "./utils/auth";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";
import { vProjectStatus, vProjectType } from "@convex/schema";

export const getProjectsByAccountId = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Result<Doc<"projects">[]> => {
    const projects = await ctx.db.query("projects").filter((q) => q.eq(q.field("accountId"), args.accountId)).collect();
    return { data: projects, error: null };
  }
})

export const getProjectBySlug = query({
  args: {
    accountToken: v.string(),
    projectSlug: v.string(),
  },
  handler: async (ctx, args): Result<Doc<"projects">, "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(internal.account.getAccountByToken, { accountToken: args.accountToken });
  
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, ["CTO", "Product Manager"]);
    if (identityError) {
      return { data: null, error: identityError };
    }
    
    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), args.projectSlug))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!project) {
      return { data: null, error: "PROJECT_NOT_FOUND" };
    }

    if (identity.role === "Product Manager" && project.productManagerId !== identity.convexUserId) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }

    return { data: project, error: null };
  },
});

export const createProjectService = internalMutation({
  args: {
    accountId: v.id("accounts"),
    project: v.object({
      name: v.string(),
      description: v.string(),
      productManagerId: v.optional(v.id("users")),
      key: v.string(),
      slug: v.string(),
      type: vProjectType,
      color: v.string(),
      status: vProjectStatus,
      start_date: v.optional(v.number()),
      target_date: v.optional(v.number())
    }),
  },
  handler: async (ctx, args): Result<Id<"projects">> => {
    const newProject = {
      name: args.project.name,
      description: args.project.description,
      productManagerId: args.project.productManagerId,
      key: args.project.key,
      slug: args.project.slug,
      type: args.project.type,
      accountId: args.accountId,
      updatedAt: Date.now(),
      status: args.project.status,
      is_archived: false,
      color: args.project.color,
      start_date: args.project.start_date ?? undefined,
      target_date: args.project.target_date ?? undefined,
    } satisfies Omit<Doc<"projects">, "_id" | "_creationTime">;

    const projectId = await ctx.db.insert("projects", newProject);
    return { data: projectId, error: null };
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
      type: vProjectType,
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

    const createProjectResult = await ctx.runMutation(internal.project.createProjectService, {
      accountId: account._id,
      project: {
        ...args.project,
        status: projectStarted ? "in_progress" : "draft",
        color: "#000000",
      },
    });
    if (createProjectResult.error) {
      return { data: null, error: createProjectResult.error };
    }

    return {
      data: {
        projectId: createProjectResult.data,
        projectName: args.project.name,
        projectSlug: args.project.slug,
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
  ): Result<(Doc<"projects"> & { productManager: Doc<"users"> | null })[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED"> => {
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
    const projectWithProductManager = (await Promise.allSettled(
      projects.map(async (project) => ({
        ...project,
        productManager: project.productManagerId ? await ctx.db.get("users", project.productManagerId) : null,
      })),
    )).map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return null;
    }).filter((project) => project !== null);

    return { data: projectWithProductManager, error: null };
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

export const getProjectTeams = query({
  args: {
    accountToken: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (
    ctx,
    args
  ): Result<Doc<"teams">[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, ["CTO", "Product Manager"]);
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

    if (identity.role === "Product Manager" && project.productManagerId !== identity.convexUserId) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }

    const teamProjects = await ctx.db
      .query("team_projects")
      .filter((q) => q.eq(q.field("project_id"), args.projectId))
      .filter((q) => q.eq(q.field("unassigned_at"), undefined))
      .collect();

    const teams = await Promise.all(
      teamProjects.map(async (tp) => {
        const team = await ctx.db.get(tp.team_id);
        return team;
      })
    );

    return { data: teams.filter((t) => t !== null), error: null };
  },
});

export const getProjectSprints = query({
  args: {
    accountToken: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (
    ctx,
    args
  ): Result<Doc<"sprints">[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: identity, error: identityError } = await requireRole(ctx, ["CTO", "Product Manager"]);
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

    if (identity.role === "Product Manager" && project.productManagerId !== identity.convexUserId) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }
    
    const sprints = await ctx.db
      .query("sprints")
      .filter((q) => q.eq(q.field("project_id"), args.projectId))
      .collect();

    return { data: sprints, error: null };
  },
});

export const initializeProjects = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
) : Result<void, "PRODUCT_MANAGER_NOT_FOUND"> => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const productManagerResult = await ctx.runQuery(internal.user.getUsersByAccountId, {
    accountId: accountId,
    role: "Product Manager",
  });
  if (productManagerResult.error) {
    return { data: null, error: productManagerResult.error };
  }
  if (!productManagerResult.data?.length) {
    return { data: null, error: "PRODUCT_MANAGER_NOT_FOUND" };
  }

  const getRandomPM = () => {
    // TODO: Get the initially specified PM from the database instead of randomizing
    return productManagerResult.data[Math.floor(Math.random() * productManagerResult.data.length)]._id;
  }
  
  const initialProjects = [
    {
      name: "Mobile App Development",
      description: "Development of the new mobile application for iOS and Android platforms with cross-platform compatibility using React Native. The app will feature user authentication, real-time notifications, offline mode capabilities, and seamless integration with our existing backend services. This project aims to expand our reach to mobile users and provide a native app experience with high performance and intuitive UI/UX design.",
      key: "MAD",
      slug: "mobile-app-development",
      type: "mobile" as const,
      color: "#3B82F6",
      status: "in_progress" as const,
      start_date: now - (30 * oneDay),
      target_date: now + (120 * oneDay),
      productManagerId: getRandomPM(),
    },
    {
      name: "Website Redesign",
      description: "Complete redesign of the company website with modern UI/UX principles, focusing on accessibility, responsive design, and improved user engagement. This project includes a comprehensive audit of the current site, competitor analysis, user research, wireframing, prototyping, and implementation using Next.js and Tailwind CSS. The new design will feature improved navigation, faster load times, better SEO optimization, and a cohesive brand identity across all pages.",
      key: "WRD",
      slug: "website-redesign",
      type: "web" as const,
      color: "#8B5CF6",
      status: "draft" as const,
      start_date: now + (14 * oneDay),
      target_date: now + (14 * oneDay) + (90 * oneDay),
      productManagerId: getRandomPM(),
    },
    {
      name: "Customer Dashboard",
      description: "Building a comprehensive customer analytics and reporting dashboard that provides real-time insights into user behavior, engagement metrics, and business performance indicators. The dashboard will feature interactive charts, customizable widgets, data export capabilities, and advanced filtering options. It will integrate with multiple data sources including our CRM, analytics platform, and sales database to provide a unified view of customer data and actionable insights for decision-making.",
      key: "CD",
      slug: "customer-dashboard",
      type: "web" as const,
      color: "#10B981",
      status: "draft" as const,
      start_date: now + (28 * oneDay),
      target_date: now + (28 * oneDay) + (75 * oneDay),
      productManagerId: getRandomPM(),
    },
  ];
  
  await Promise.all(
    initialProjects.map(async (project) => {
      const createProjectResult = await ctx.runMutation(internal.project.createProjectService, {
        accountId: accountId,
        project
      });
      if (createProjectResult.error) {
        return;  // TODO: HANDLE THE ERROR
      }
      return createProjectResult.data;
    })
  );

  return { data: undefined, error: null };
};