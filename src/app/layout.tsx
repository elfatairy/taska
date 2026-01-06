import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/contexts/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Taska - Manage your projects efficiently",
  description: "Manage your projects with Taska efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loading />}>
          <ClerkProvider>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}

function Loading() { // TODO: Improve this loading component
  return (
    <div className="h-screen w-screen flex items-center justify-center pb-16">
      <Loader2 className="animate-spin" size={32} />
    </div>
  )
}