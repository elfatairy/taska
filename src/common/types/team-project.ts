import { Doc } from "@convex/_generated/dataModel";
import type { Team } from "./team";
import type { Project } from "./project";

export type TeamProject = Doc<"team_projects">;
export type TeamProjectId = TeamProject["_id"];

// General combined type - TeamProject with project details
export type TeamProjectWithProject = TeamProject & {
  project: Project;
};

// General combined type - TeamProject with team details
export type TeamProjectWithTeam = TeamProject & {
  team: Team;
};
