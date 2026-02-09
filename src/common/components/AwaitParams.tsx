import { use } from "react";

export function AwaitParams<Route extends string, Params extends Record<string, string>>({
  children,
  params
}: {
  children: (params: Params) => React.ReactNode;
  params: Promise<Params>;
}) {
  const awaitedParams = use(params);
  return children(awaitedParams);
}