import { useState } from "react";

export function useWithLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const runWithLoading = async <T>(promise: () => Promise<T>) => {
    setIsLoading(true);
    await promise();
    setIsLoading(false);
  }

  return { isLoading, runWithLoading };
}