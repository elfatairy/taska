import { Icon } from "@/common/components/Icon";

export default function ProfilePlaceholderIcon() {
  return (
    <div
      className="flex items-center justify-center bg-muted text-muted-foreground rounded-full w-9 h-9"
      aria-label="Open Profile Menu"
    >
      <Icon icon='Profile' className="w-4 h-4" aria-hidden="true" />
    </div>
  )
}