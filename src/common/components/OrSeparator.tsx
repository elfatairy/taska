import { cn } from "@/lib/utils";

export const OrSeparator = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="w-full h-px bg-border" />
      <span className="text-sm uppercase text-muted-foreground px-2">or</span>
      <div className="w-full h-px bg-border" />
    </div>
  )
}