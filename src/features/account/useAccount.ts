"use client";

import { ACCOUNT_COOKIE_NAME } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
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

  try {
    return useQuery(query, newArgs);
  } catch (error) {
    console.error(error);
    return { data: null, error: "UNEXPECTED_ERROR" as const };
  }
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

    try {
      // @ts-expect-error: TypeScript might complain that the original type didn't // TODO: Fix this
      return originalMutation({ ...args, accountToken });
    } catch (error) {
      console.error(error);
      return { data: null, error: "UNEXPECTED_ERROR" as const };
    }
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

    try {
      // @ts-expect-error: TypeScript might complain that the original type didn't
      return originalAction({ ...args, accountToken });
    } catch (error) {
      console.error(error);
      return { data: null, error: "UNEXPECTED_ERROR" as const };
    }
  };
}
