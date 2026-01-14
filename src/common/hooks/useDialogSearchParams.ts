import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

export function useDialogSearchParams(paramsValues: Record<string, string | undefined>, open: boolean) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleUrlParams = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpen) {
      Object.entries(paramsValues).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
    } else {
      Object.keys(paramsValues).forEach((key) => {
        params.delete(key);
      });
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleUrlParamsEffect = useEffectEvent(handleUrlParams);
  useEffect(() => {
    if (open) handleUrlParamsEffect(true);
  }, [open]);

  return { handleUrlParams };
}