"use client";

import { ACCOUNT_COOKIE_NAME } from "@/lib/constants";
import { OptionalRestArgsOrSkip, useAction, useMutation, useQuery } from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";
import { Value } from "convex/values";

function useAccountId() {
  if (typeof document === "undefined") {
    return undefined;
  }

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCOUNT_COOKIE_NAME}=`))
    ?.split("=")[1];
}

export function useAccountQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalRestArgs<Query>
) {
  const accountId = useAccountId();

  const originalArgs = args[0] || {};
  const newArgs = (accountId
    ? { ...originalArgs, accountId }
    : ("skip" as const)) as unknown as OptionalRestArgsOrSkip<Query>;

  return useQuery(query, ...newArgs);
}

export function useAccountMutation<
  Mutation extends FunctionReference<"mutation">
>(mutation: Mutation) {
  const originalMutation = useMutation(mutation);
  const accountId = useAccountId();

  return async (args?: Record<string, Value>) => {
    if (!accountId) {
      throw new Error("Cannot run mutation: Account ID cookie missing.");
    }
    
    // @ts-expect-error: TypeScript might complain that the original type didn't 
    return originalMutation({...args, accountId});
  };
}

export function useAccountAction<
  Action extends FunctionReference<"action">
>(action: Action) {
  const originalAction = useAction(action);
  const accountId = useAccountId();

  return async (args?: Record<string, Value>) => {
    if (!accountId) {
      throw new Error("Cannot run action: Account ID cookie missing.");
    }

    // @ts-expect-error: TypeScript might complain that the original type didn't 
    return originalAction({...args, accountId});
  };
}