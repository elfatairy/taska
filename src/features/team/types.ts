import { Doc } from "@convex/_generated/dataModel";

export type Team = Doc<"teams"> & {
  memberIds: Doc<"users">['_id'][],
  teamLead: Doc<"users"> | null,
  projectIds: Doc<"projects">['_id'][]
}

export type TeamMember = Doc<"team_members"> & {
  user: Doc<"users">
}

export type TeamProject = Doc<"team_projects"> & {
  project: Doc<"projects">
  productManager: Doc<"users"> | null
}

export type TeamLead = Doc<"users">