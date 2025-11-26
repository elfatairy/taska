import { ConvexHttpClient } from "convex/browser";

// Initialize the client
export const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);