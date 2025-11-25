import Link from "next/link";
import { Icon } from "./Icon";

export default function AppLogo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" aria-label="Go to Dashboard Overview">
      <Icon
        icon='Logo'
        width={30}
        height={30}
        aria-label="Taska Logo"
        className={className}
        strokeWidth={0}
      />
    </Link>
  )
}
