import { clerkMiddleware } from '@clerk/nextjs/server'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { convexClient } from "./lib/convex-client"
import { api } from "./convex/_generated/api"
import { ACCOUNT_COOKIE_NAME } from './lib/constants'

export default clerkMiddleware(async () => {
  const response = NextResponse.next()
  
  const cookieName = ACCOUNT_COOKIE_NAME
  const age = 60 * 60 * 24 * 30 * 3
  
  const existingCookie = (await cookies()).get(cookieName)
  const valueToSet = existingCookie?.value || crypto.randomUUID()

  response.cookies.set({
    name: cookieName,
    value: valueToSet,
    path: '/',
    maxAge: age,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  if (!existingCookie) {
    convexClient.action(api.account.initializeAccount, {
      tokenIdentifier: valueToSet,
    })
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}