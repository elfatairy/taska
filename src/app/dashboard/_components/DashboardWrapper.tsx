'use client';

import { useMainSection } from "@/contexts/MainSectionContext";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { mainRef } = useMainSection();
  return (
    <div id="main" ref={mainRef} className="focus:inset-ring-2 inset-ring-ring min-h-full">
      {children}
    </div>
  )
}