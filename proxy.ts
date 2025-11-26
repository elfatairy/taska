import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { convexClient } from "./lib/convex-client"
import { api } from "./convex/_generated/api"

export default async function proxy() {
  const response = NextResponse.next()
  
  const cookieName = 'taska-account-token'
  const age = 60 * 60 * 24 * 30 * 3
  
  const existingCookie = (await cookies()).get(cookieName)
  const valueToSet = existingCookie?.value || crypto.randomUUID()

  response.cookies.set({
    name: cookieName,
    value: valueToSet,
    path: '/',
    maxAge: age,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  if (!existingCookie) {
    await convexClient.mutation(api.account.initializeAccount, {
      tokenIdentifier: valueToSet,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}