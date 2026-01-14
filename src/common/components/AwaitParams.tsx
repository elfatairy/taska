import { AppRoutes, ParamMap } from "../../../.next/dev/types/routes";
import { use } from "react";

export function AwaitParams<Route extends AppRoutes, Params extends ParamMap[Route]>({ 
  children, 
  params 
}: {
  children: (params: Params) => React.ReactNode;
  params: Promise<Params>;
}) {
  const awaitedParams = use(params);
  return children(awaitedParams);
}