import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/app/dashboard/_components/DashboardHeader";
import { DashboardSidebar } from "@/app/dashboard/_components/sidebar/Sidebar";
import { MainSectionProvider } from "@/contexts/MainSectionContext";
import DashboardWrapper from "./_components/DashboardWrapper";
import AccessibilityLinks from "@/components/AccessibilityLinks";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login')
  }

  return (
    <MainSectionProvider>
      <AccessibilityLinks />

      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <DashboardHeader />
          <div className="flex flex-1">
            <DashboardSidebar />
            <SidebarInset>
              <DashboardWrapper>{children}</DashboardWrapper>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </MainSectionProvider>
  )
}