"use client";

import { ACCOUNT_COOKIE_NAME } from "@/lib/constants";
import { api } from "@convex/_generated/api";
import {
  OptionalRestArgsOrSkip,
  useAction,
  useMutation,
  useQuery,
} from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";
import { Value } from "convex/values";

function useAccountToken() {
  if (typeof document === "undefined") {
    return undefined;
  }

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCOUNT_COOKIE_NAME}=`))
    ?.split("=")[1];
}

export function useAccountQuery<
  Query extends FunctionReference<"query">,
  Args extends Omit<OptionalRestArgs<Query>[0], "accountToken">
>(query: Query, args: Args = {} as Args) {
  const accountToken = useAccountToken();

  const originalArgs = args || {};
  const newArgs = (accountToken
    ? { ...originalArgs, accountToken }
    : ("skip" as const)) as unknown as OptionalRestArgsOrSkip<Query>[0];

  return useQuery(query, newArgs);
}

export function useAccountMutation<
  Mutation extends FunctionReference<"mutation">
>(mutation: Mutation) {
  const originalMutation = useMutation(mutation);
  const accountToken = useAccountToken();

  return async (args?: Record<string, Value>) => {
    if (!accountToken) {
      throw new Error("Cannot run mutation: Account ID cookie missing.");
    }

    // @ts-expect-error: TypeScript might complain that the original type didn't
    return originalMutation({ ...args, accountToken });
  };
}

export function useAccountAction<Action extends FunctionReference<"action">>(
  action: Action
) {
  const originalAction = useAction(action);
  const accountToken = useAccountToken();

  return async (args?: Record<string, Value>) => {
    if (!accountToken) {
      throw new Error("Cannot run action: Account ID cookie missing.");
    }

    // @ts-expect-error: TypeScript might complain that the original type didn't
    return originalAction({ ...args, accountToken });
  };
}
