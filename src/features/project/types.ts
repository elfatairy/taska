import { Doc } from "@convex/_generated/dataModel";

export const PROJECT_TYPES = [
  { label: "Desktop App", value: "desktop" } as const,
  { label: "Mobile App", value: "mobile" } as const,
  { label: "Web App", value: "web" } as const,
  { label: "Backend", value: "backend" } as const,
  { label: "AI", value: "ai" } as const,
  { label: "Game", value: "game" } as const,
  { label: "Other", value: "other" } as const,
];

export type Project = Doc<"projects">

// TODO: Think about cross feature importing
export type Team = Doc<"teams"> & {
  memberIds: Doc<"users">["_id"][];
  teamLead: Doc<"users"> | null;
  projectIds: Doc<"projects">["_id"][];
}

export type ProjectId = Project['_id']