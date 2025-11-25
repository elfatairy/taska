'use client';

import { useMainSection } from "@/contexts/MainSectionContext";
import { Button } from "@/components/ui/button";

export default function AccessibilityLinks() {
  const { focusMain } = useMainSection();

  return (
    <>
      <Button
        variant="link"
        className="fixed top-0 left-0 z-20 py-2 px-4 font-bold bg-background opacity-0 pointer-events-none focus:pointer-events-auto focus:opacity-100"
        onClick={focusMain}
      >
        Skip to content
      </Button>
    </>
  )
}