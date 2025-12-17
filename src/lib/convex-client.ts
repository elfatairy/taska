import { ConvexHttpClient } from "convex/browser";
import {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";
import { cookies } from "next/headers";
import { ACCOUNT_COOKIE_NAME } from "./constants";
import { api } from "@convex/_generated/api";

// Initialize the client
export const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export const getaccountToken = async () => {
  const cookiesList = await cookies();
  return cookiesList.get(ACCOUNT_COOKIE_NAME)?.value;
};

export const convexQuery = async <
  Query extends FunctionReference<"query", "public">
>(
  query: Query,
  args: FunctionArgs<Query> = {}
): Promise<FunctionReturnType<Query>> => {
  const accountToken = await getaccountToken();
  return await convexClient.query(query, {
    ...args,
    accountToken: accountToken ?? "skip",
  });
};
