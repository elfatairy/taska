import { Doc } from "@convex/_generated/dataModel";
import type { User, UserId } from "./user";
import { ProjectId } from "./project";

export type Team = Doc<"teams">;
export type TeamId = Team["_id"];

// General combined type - Team with its lead
export type TeamWithLead = Team & {
  teamLead: User | null;
};

export type TeamWithMembers = Team & {
  memberIds: UserId[];
};

export type TeamWithProjects = Team & {
  projectIds: ProjectId[];
};