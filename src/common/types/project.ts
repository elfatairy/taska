import { Doc } from "@convex/_generated/dataModel";
import type { User } from "./user";

export type Project = Doc<"projects">;
export type ProjectId = Project["_id"];
export type ProjectStatus = Project["status"];
export type ProjectType = Project["type"];

// General combined type - Project with its product manager
export type ProjectWithManager = Project & {
  productManager: User | null;
};
