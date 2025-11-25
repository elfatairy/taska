import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex", className)}>
      <Input
        type="text"
        placeholder="Search"
        icon={SearchIcon}
        iconProps={{ behavior: 'prepend' }}
      />
    </div>
  )
}

function SearchIcon({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon
      icon="Search"
      strokeWidth={0.1}
      aria-hidden="true"
      {...props}
    />
  )
}
