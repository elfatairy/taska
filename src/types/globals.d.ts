import { ROLES } from "@convex/utils/constants"

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: (typeof ROLES)[number]
    }
  }
}