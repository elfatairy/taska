import { Doc } from "@convex/_generated/dataModel";
import type { Project } from "./project";
import type { Team } from "./team";
import type { User } from "./user";
import type { Sprint } from "./sprint";

export type Task = Doc<"tasks">;
export type TaskId = Task["_id"];
export type TaskStatus = Task["status"];
export type TaskPriority = Task["priority"];

// General combined types - commonly needed across features
export type TaskWithProject = Task & {
  project: Project;
};

export type TaskWithTeam = Task & {
  team: Team;
};

export type TaskWithAssignee = Task & {
  assignee: User | null;
};

export type TaskWithSprint = Task & {
  sprint: Sprint | null;
};

export type TaskWithCreator = Task & {
  creator: User;
};

// Fully populated task - useful across multiple features
export type TaskDetail = Task & {
  project: Project;
  team: Team;
  sprint: Sprint | null;
  assignee: User | null;
  creator: User;
};
