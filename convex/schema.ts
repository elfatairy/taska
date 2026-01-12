import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { PROJECT_STATUS, PROJECT_TYPES, ROLES, SPRINT_STATUS, TASK_STATUS, TASK_PRIORITY } from "@convex/utils/constants";

export const vUserRole = v.union(
  v.literal("CTO" as const),
  ...ROLES.map(role => v.literal(role)),
)

export const vProjectStatus = v.union(
  ...PROJECT_STATUS.map(status => v.literal(status)),
)

export const vProjectType = v.union(
  ...PROJECT_TYPES.map(type => v.literal(type)),
)

export const vSprintStatus = v.union(
  ...SPRINT_STATUS.map(status => v.literal(status)),
)

export const vTaskStatus = v.union(
  ...TASK_STATUS.map(status => v.literal(status)),
)

export const vTaskPriority = v.union(
  ...TASK_PRIORITY.map(priority => v.literal(priority)),
)

export default defineSchema({
  accounts: defineTable({
    accountToken: v.string(),
    isAnonymous: v.boolean(),
    deletedAt: v.optional(v.number()),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    profile_slug: v.optional(v.string()),
    role: vUserRole,
    isOnline: v.boolean(),
    accountId: v.id("accounts"),
    updatedAt: v.number(),
    clerkUserId: v.string(),
  }),
  projects: defineTable({
    name: v.string(), //
    description: v.string(), //
    productManagerId: v.optional(v.id("users")), //
    key: v.string(), // 
    slug: v.string(),
    status: vProjectStatus, //
    start_date: v.optional(v.number()),
    target_date: v.optional(v.number()),
    completed_date: v.optional(v.number()),
    is_archived: v.boolean(),
    color: v.string(),
    type: vProjectType, //
    accountId: v.id("accounts"),
    updatedAt: v.number(),
  }),
  teams: defineTable({
    name: v.string(),
    description: v.string(),
    previous_slug: v.optional(v.string()),
    slug: v.string(),
    team_lead_id: v.optional(v.id("users")),
    accountId: v.id("accounts"),
    updatedAt: v.number(),
  }),
  team_members: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(
      v.literal("team_lead" as const),
      v.literal("member" as const),
    ),
    is_primary: v.boolean(),
    updatedAt: v.number(),
  }),
  team_projects: defineTable({
    team_id: v.id("teams"),
    project_id: v.id("projects"),
    assigned_at: v.number(),
    assigned_by: v.id("users"),
    unassigned_at: v.optional(v.number()),
    unassigned_by: v.optional(v.id("users")),
    updated_at: v.number(),
  }),
  sprints: defineTable({
    project_id: v.id("projects"),
    team_id: v.id("teams"),
    name: v.string(),
    goal: v.string(),
    status: vSprintStatus,
    start_date: v.number(),
    end_date: v.number(),
    created_by: v.id("users"),
    created_at: v.number(),
    updated_at: v.number(),
    started_at: v.optional(v.number()),
    completed_at: v.optional(v.number()),
    canceled_at: v.optional(v.number()),
    cancel_reason: v.optional(v.string()),
  }),
  tasks: defineTable({
    project_id: v.id("projects"),
    team_id: v.id("teams"),
    sprint_id: v.optional(v.id("sprints")),
    title: v.string(),
    description: v.string(),
    acceptance_criteria: v.optional(v.string()),
    status: vTaskStatus,
    priority: v.optional(vTaskPriority),
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
});