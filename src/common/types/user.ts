import { Doc } from "@convex/_generated/dataModel";

export type User = Doc<"users">;
export type UserId = User["_id"];
export type UserRole = User["role"];
