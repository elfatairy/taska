import { v } from "convex/values";
import { ActionCtx, internalMutation, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { Result } from "./utils/types";
import { internal } from "./_generated/api";
import { getUserIdentity, requireRole } from "./utils/auth";
import { vTaskPriority, vTaskStatus } from "./schema";
import { Task } from "@/common/types";
import { filter } from "convex-helpers/server/filter";

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

export const initializeTasks = async (
  ctx: ActionCtx,
  accountId: Doc<"accounts">["_id"]
): Result<void, "NO_SPRINTS_FOUND" | "NO_USERS_FOUND"> => {
  const now = Date.now();

  // Get all sprints
  const sprintsResult = await ctx.runQuery(internal.sprint.getSprintsByAccountId, {
    accountId: accountId,
  });
  if (sprintsResult.error || !sprintsResult.data?.length) {
    return { data: null, error: "NO_SPRINTS_FOUND" };
  }
  const sprints = sprintsResult.data;

  // Get all users to assign tasks
  const allUsersResult = await ctx.runQuery(internal.user.getUsersByAccountId, {
    accountId: accountId,
  });
  if (allUsersResult.error || !allUsersResult.data?.length) {
    return { data: null, error: "NO_USERS_FOUND" };
  }
  const allUsers = allUsersResult.data;

  // Get product managers
  const productManagers = allUsers.filter(u => u.role === "Product Manager");
  const defaultCreator = productManagers[0]?._id || allUsers[0]._id;

  // Task templates with realistic data
  const taskTemplates = [
    {
      title: "Set up project repository and CI/CD pipeline",
      description: "Initialize Git repository, configure branch protection rules, set up continuous integration with automated testing, and establish deployment pipelines for staging and production environments. Include Docker configuration and infrastructure as code.",
      acceptance_criteria: "Repository created with proper .gitignore, CI/CD pipeline running successfully, automated tests passing, deployment to staging works",
      status: "DONE" as const,
      priority: "HIGH" as const,
      estimate: 8,
    },
    {
      title: "Implement user authentication system",
      description: "Build complete authentication system with login, registration, password reset, and email verification. Implement JWT tokens, refresh token rotation, and secure session management. Include OAuth integration for Google and GitHub.",
      acceptance_criteria: "Users can register, login, reset password, verify email. JWT tokens working. OAuth providers integrated. Security best practices followed.",
      status: "DONE" as const,
      priority: "HIGH" as const,
      estimate: 13,
    },
    {
      title: "Design and implement database schema",
      description: "Design comprehensive database schema covering all entities and relationships. Implement migrations, indexing strategy, and data validation rules. Document schema design decisions and create ER diagrams.",
      acceptance_criteria: "All tables created with proper relationships, indexes, and constraints. Migrations working. Documentation complete.",
      status: "DONE" as const,
      priority: "HIGH" as const,
      estimate: 8,
    },
    {
      title: "Create responsive navigation component",
      description: "Build fully responsive navigation component that works seamlessly across desktop, tablet, and mobile devices. Include hamburger menu for mobile, dropdown menus, search functionality, and accessibility features (keyboard navigation, ARIA labels).",
      acceptance_criteria: "Navigation works on all screen sizes, hamburger menu functional, accessible via keyboard, ARIA labels present, search working",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      estimate: 5,
    },
    {
      title: "Implement user profile management",
      description: "Build user profile pages with ability to view and edit profile information, upload profile pictures, manage account settings, and view activity history. Include form validation, image optimization, and privacy controls.",
      acceptance_criteria: "Users can view and edit profiles, upload pictures (with size limits), change settings, view history. All forms validated.",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      estimate: 8,
    },
    {
      title: "Build dashboard with analytics",
      description: "Create comprehensive dashboard showing key metrics, charts, and insights. Implement real-time data updates, interactive charts using D3.js or Chart.js, customizable widgets, and data export functionality.",
      acceptance_criteria: "Dashboard displays all metrics, charts are interactive, real-time updates working, widgets customizable, export to CSV/PDF works",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      estimate: 13,
    },
    {
      title: "Implement real-time notifications",
      description: "Build real-time notification system using WebSockets. Include in-app notifications, push notifications for web and mobile, notification preferences, and notification history. Implement rate limiting and batching.",
      acceptance_criteria: "Real-time notifications working, push notifications enabled, preferences saveable, history visible, rate limiting active",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      estimate: 8,
    },
    {
      title: "Create admin panel",
      description: "Build comprehensive admin panel for system management. Include user management (CRUD operations), role assignment, system monitoring, audit logs, and analytics dashboard. Implement proper authorization checks.",
      acceptance_criteria: "Admin can manage users, assign roles, view logs, monitor system. All actions authorized. Analytics visible.",
      status: "TODO" as const,
      priority: "LOW" as const,
      estimate: 13,
    },
    {
      title: "Implement search functionality",
      description: "Build robust search feature with autocomplete, filters, sorting, and pagination. Implement full-text search, search history, saved searches, and search analytics. Optimize for performance with proper indexing.",
      acceptance_criteria: "Search returns accurate results, autocomplete works, filters and sorting functional, pagination working, fast response times",
      status: "BACKLOG" as const,
      priority: "MEDIUM" as const,
      estimate: 8,
    },
    {
      title: "Add data export functionality",
      description: "Implement data export in multiple formats (CSV, Excel, PDF, JSON). Include custom field selection, date range filters, scheduled exports, and email delivery. Handle large datasets efficiently.",
      acceptance_criteria: "Export to all formats works, custom fields selectable, filters working, scheduled exports functional, large datasets handled",
      status: "BACKLOG" as const,
      priority: "LOW" as const,
      estimate: 5,
    },
    {
      title: "Optimize application performance",
      description: "Conduct comprehensive performance audit and optimization. Implement code splitting, lazy loading, image optimization, caching strategies, and database query optimization. Achieve target performance metrics.",
      acceptance_criteria: "Load time < 2s, Lighthouse score > 90, queries optimized, images compressed, code split properly",
      status: "BACKLOG" as const,
      priority: "MEDIUM" as const,
      estimate: 8,
    },
    {
      title: "Write comprehensive documentation",
      description: "Create complete documentation including API documentation, user guides, developer guides, deployment instructions, and troubleshooting guides. Use tools like Swagger for API docs.",
      acceptance_criteria: "All APIs documented with Swagger, user guides complete, developer setup guide working, deployment docs accurate",
      status: "BACKLOG" as const,
      priority: "LOW" as const,
      estimate: 5,
    },
  ];

  // Create tasks for each sprint
  for (const sprint of sprints) {
    // Get team members for this sprint's team
    const teamMembersResult = await ctx.runQuery(internal.team.getTeamMembersByTeamId, {
      teamId: sprint.team_id,
    });
    const teamMembers = teamMembersResult.data || [];
    const assignableUsers = teamMembers.length > 0 ? teamMembers : allUsers;

    // Determine how many tasks based on sprint status
    let taskCount = 4;
    if (sprint.status === "COMPLETED") taskCount = 6;
    else if (sprint.status === "ACTIVE") taskCount = 8;
    else if (sprint.status === "READY") taskCount = 5;

    // Get random tasks from templates
    const shuffledTasks = [...taskTemplates].sort(() => 0.5 - Math.random());
    const selectedTasks = shuffledTasks.slice(0, taskCount);

    for (let i = 0; i < selectedTasks.length; i++) {
      const template = selectedTasks[i];
      const assignee = assignableUsers[i % assignableUsers.length];
      
      // Adjust status based on sprint status
      let taskStatus = template.status;
      if (sprint.status === "COMPLETED") {
        taskStatus = "DONE";
      } else if (sprint.status === "PLANNED") {
        taskStatus = i === 0 ? "TODO" : "BACKLOG";
      }

      await ctx.runMutation(internal.task.createTaskService, {
        task: {
          project_id: sprint.project_id,
          team_id: sprint.team_id,
          sprint_id: sprint._id,
          title: template.title,
          description: template.description,
          acceptance_criteria: template.acceptance_criteria,
          status: taskStatus,
          priority: template.priority,
          assignee_id: assignee._id,
          estimate: template.estimate,
          unplanned: false,
          carry_over_count: 0,
          created_by: defaultCreator,
          created_at: sprint.created_at,
          updated_at: now,
          completed_at: taskStatus === "DONE" ? sprint.completed_at : undefined,
        }
      });
    }
  }

  return { data: undefined, error: null };
};

export const createTaskService = internalMutation({
  args: {
    task: v.object({
      project_id: v.id("projects"),
      team_id: v.id("teams"),
      sprint_id: v.optional(v.id("sprints")),
      title: v.string(),
      description: v.string(),
      acceptance_criteria: v.optional(v.string()),
      status: v.union(
        v.literal("BACKLOG"),
        v.literal("TODO"),
        v.literal("IN_PROGRESS"),
        v.literal("IN_REVIEW"),
        v.literal("BLOCKED"),
        v.literal("DONE"),
      ),
      priority: v.optional(v.union(
        v.literal("LOW"),
        v.literal("MEDIUM"),
        v.literal("HIGH"),
      )),
      assignee_id: v.optional(v.id("users")),
      estimate: v.optional(v.number()),
      unplanned: v.boolean(),
      carry_over_count: v.number(),
      previous_sprint_id: v.optional(v.id("sprints")),
      blocked_reason: v.optional(v.string()),
      created_by: v.id("users"),
      created_at: v.number(),
      updated_at: v.number(),
      completed_at: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"tasks">> => {
    const taskId = await ctx.db.insert("tasks", args.task);
    return taskId;
  }
});

export const getTasksByProjectId = query({
  args: {
    accountToken: v.string(),
    projectId: v.id("projects"),
    filters: v.optional(v.object({
      status: v.optional(v.array(vTaskStatus)),
    })),
  },
  handler: async (ctx, args): Result<Task[], "NOT_AUTHENTICATED" | "NOT_AUTHORIZED" | "PROJECT_NOT_FOUND" | "UNEXPECTED_ERROR"> => {
    const { data: account } = await ctx.runQuery(
      internal.account.getAccountByToken,
      {
        accountToken: args.accountToken,
      }
    );
    if (!account) {
      return { data: null, error: "NOT_AUTHENTICATED" };
    }

    const project = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("_id"), args.projectId))
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .unique();
    if (!project) {
      return { data: null, error: "PROJECT_NOT_FOUND" };
    }

    const { data: identity, error: identityError } = await getUserIdentity(ctx);
    if (identityError) {
      return { data: null, error: identityError };
    }

    if (identity.role === "Product Manager" && project.productManagerId !== identity.convexUserId) {
      return { data: null, error: "NOT_AUTHORIZED" };
    }

    let tasksQuery = filter(
      ctx.db.query("tasks"),
      (task) => task.project_id === args.projectId && (args.filters?.status?.includes(task.status) ?? true)
    );

    if (!['CTO', 'Product Manager'].includes(identity.role ?? "")) {
      const userTeams = await ctx.runQuery(internal.user.getUserTeams, {
        userId: identity.convexUserId,
        accountId: account._id,
      });
      if (userTeams.error) {
        return { data: null, error: userTeams.error };
      }
      const userTeamsIds = userTeams.data?.map(team => team._id);
      tasksQuery = filter(
        tasksQuery,
        (task) => userTeamsIds?.includes(task.team_id)
      )
    }
    const tasks = await tasksQuery.collect();
    return { data: tasks, error: null };
  }
});
