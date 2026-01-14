import type { Team, User, UserId, ProjectId } from "@/common/types";

export const PROJECT_TYPES = [
  { label: "Desktop App", value: "desktop" } as const,
  { label: "Mobile App", value: "mobile" } as const,
  { label: "Web App", value: "web" } as const,
  { label: "Backend", value: "backend" } as const,
  { label: "AI", value: "ai" } as const,
  { label: "Game", value: "game" } as const,
  { label: "Other", value: "other" } as const,
];

export type ProjectTeam = Team & {
  memberIds: UserId[];
  teamLead: User | null;
  projectIds: ProjectId[];
};