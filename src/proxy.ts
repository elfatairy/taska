import {
  auth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { ACCOUNT_COOKIE_NAME } from "@/lib/constants";

const isAuthenticatedRoutes = createRouteMatcher(["/dashboard(.*)"]);
const routesPermissions = {
  "/dashboard/manage/users": ["CTO"],
  "/dashboard/projects": ["CTO", "Product Manager"],
  "/dashboard/projects/new": ["CTO"],
};
const unauthenticatedRoutes = ["/login"];

export default clerkMiddleware(
  async (_auth: typeof auth, request: NextRequest) => {
    const { userId, sessionClaims } = await _auth();
    
    if (isAuthenticatedRoutes(request)) {
      if (!userId) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      const userRole = sessionClaims!.metadata.role!;
      const routePermissions = routesPermissions[request.nextUrl.pathname as keyof typeof routesPermissions];
      if (routePermissions && !routePermissions.includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (unauthenticatedRoutes.includes(request.nextUrl.pathname) && userId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    

    const response = NextResponse.next();

    const cookieName = ACCOUNT_COOKIE_NAME;
    const age = 60 * 60 * 24 * 30 * 3;

    const existingCookie = (await cookies()).get(cookieName);
    const valueToSet = existingCookie?.value || crypto.randomUUID();

    response.cookies.set({
      name: cookieName,
      value: valueToSet,
      path: "/",
      maxAge: age,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    if (!existingCookie) {
      convexClient.action(api.account.initializeAccount, {
        accountToken: valueToSet,
      });
    }

    return response;
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
