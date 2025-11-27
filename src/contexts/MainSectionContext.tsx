"use client";

import { createContext, useContext, useRef } from "react";

const mainSectionContext = createContext<{ mainRef: React.RefObject<HTMLDivElement | null>, focusMain: () => void }>({ mainRef: { current: null }, focusMain: () => { } });

export function MainSectionProvider({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLDivElement | null>(null);

  const focusMain = () => {
    if (mainRef.current) {
      mainRef.current.tabIndex = -1;
      mainRef.current.focus();
      setTimeout(() => mainRef.current?.removeAttribute("tabindex"), 1000);
    }
  }

  return (
    <mainSectionContext.Provider value={{ mainRef, focusMain }}>
      {children}
    </mainSectionContext.Provider>
  )
}

export function useMainSection() {
  const context = useContext(mainSectionContext);
  if (!context) throw new Error("useMainSection must be used within a MainSectionProvider");
  return context;
}