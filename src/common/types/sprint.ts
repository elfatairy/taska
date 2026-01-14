import { Doc } from "@convex/_generated/dataModel";
import type { Project } from "./project";
import type { Team } from "./team";
import type { User } from "./user";

export type Sprint = Doc<"sprints">;
export type SprintId = Sprint["_id"];
export type SprintStatus = Sprint["status"];

// General combined type - Sprint with project
export type SprintWithProject = Sprint & {
  project: Project;
};

// General combined type - Sprint with team
export type SprintWithTeam = Sprint & {
  team: Team;
};

// General combined type - Sprint with creator
export type SprintWithCreator = Sprint & {
  creator: User;
};
