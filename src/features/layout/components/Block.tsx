import { cn } from "@/lib/utils";

export function Block({ children, fullHeight = false }: { children: React.ReactNode, fullHeight?: boolean }) {
  return (
    <div className={cn("space-y-4 p-4", fullHeight ? "flex-1" : "")}>
      <div className={cn("flex flex-col gap-4 bg-card rounded-md", fullHeight ? "h-full" : "")}>
        {children}
      </div>
    </div>
  )
}