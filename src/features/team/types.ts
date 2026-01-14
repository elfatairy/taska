// Feature-specific extended types (matching API responses)
// Import base types from @/common/types in components
import type { Team, User, UserId, Project, ProjectId, TeamMember, TeamProject } from "@/common/types";

export type TeamDetail = Team & {
  memberIds: UserId[];
  teamLead: User | null;
  projectIds: ProjectId[];
};

export type TeamMemberDetail = TeamMember & {
  user: User;
};

export type TeamProjectDetail = TeamProject & {
  project: Project;
  productManager: User | null;
};