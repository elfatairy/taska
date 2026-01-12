export const INITIAL_USERS_PASSWORD = "2<.QT8h^4-AH";

export const ROLES = [
  "Product Manager",
  "Frontend Developer",
  "Backend Developer",
  "Designer",
  "QA",
  "DevOps"
] as const;

export const PROJECT_STATUS = [
  "draft",
  "in_progress",
  "on_hold",
  "cancelled",
  "completed",
] as const;

export const PROJECT_TYPES = [
  "mobile",
  "desktop",
  "web",
  "backend",
  "ai",
  "game",
  "other",
] as const;

export const SPRINT_STATUS = [
  "PLANNED",
  "READY",
  "ACTIVE",
  "COMPLETED",
  "CANCELED",
] as const;

export const TASK_STATUS = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "DONE",
] as const;

export const TASK_PRIORITY = [
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;