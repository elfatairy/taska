/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as account_delete from "../account/delete.js";
import type * as auth from "../auth.js";
import type * as project from "../project.js";
import type * as services_clerk from "../services/clerk.js";
import type * as team from "../team.js";
import type * as user from "../user.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_constants from "../utils/constants.js";
import type * as utils_slugify from "../utils/slugify.js";
import type * as utils_types from "../utils/types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  "account/delete": typeof account_delete;
  auth: typeof auth;
  project: typeof project;
  "services/clerk": typeof services_clerk;
  team: typeof team;
  user: typeof user;
  "utils/auth": typeof utils_auth;
  "utils/constants": typeof utils_constants;
  "utils/slugify": typeof utils_slugify;
  "utils/types": typeof utils_types;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
