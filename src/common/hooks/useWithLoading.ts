import { useState } from "react";

export function useWithLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const runWithLoading = async <T>(promise: () => Promise<T>) => {
    try {
      setIsLoading(true);
      await promise();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, runWithLoading };
}