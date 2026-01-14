'use client'

import { useEffect, useState } from "react";

export function useCountDown(initialValue: number, onDone: () => void) {
  const [countdown, setCountdown] = useState(initialValue);

  useEffect(() => {
    if (countdown <= 0) {
      onDone();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onDone]);

  return { countdown };
}