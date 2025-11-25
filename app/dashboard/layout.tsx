import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/app/dashboard/_components/DashboardHeader";
import { DashboardSidebar } from "@/app/dashboard/_components/sidebar/sidebar";
import { Metadata } from "next";
import { MainSectionProvider } from "@/contexts/MainSectionContext";
import DashboardWrapper from "./_components/DashboardWrapper";
import AccessibilityLinks from "@/components/AccessibilityLinks";

export const metadata: Metadata = {
  title: "Taska - Manage your projects efficiently",
  description: "Manage your projects with Taska efficiently"
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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