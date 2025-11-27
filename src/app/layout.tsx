import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/contexts/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

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
      <body className="antialiased">
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
