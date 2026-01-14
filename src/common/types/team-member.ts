import { Doc } from "@convex/_generated/dataModel";
import type { User } from "./user";
import type { Team } from "./team";

export type TeamMember = Doc<"team_members">;
export type TeamMemberId = TeamMember["_id"];

// General combined type - TeamMember with user details
export type TeamMemberWithUser = TeamMember & {
  user: User;
};

// General combined type - TeamMember with team details
export type TeamMemberWithTeam = TeamMember & {
  team: Team;
};
