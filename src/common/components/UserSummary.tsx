import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { User } from "@/common/types"
import { CopyCopied, CopyToClipboard, CopyUncopied } from "./ui/copy"
import { Check } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export function UserSummary({ user, enableCopy = true, size = "default" }: { user: User, enableCopy?: boolean, size?: "default" | "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar user={user} size={size} />
      <div className="flex flex-col">
        <UserName user={user} enableCopy={enableCopy} size={size} />
        <UserEmail user={user} enableCopy={enableCopy} size={size} />
      </div>
    </div>
  )
}

const userAvatarVariants = cva("rounded-full", {
  variants: {
    size: {
      default: "h-8 w-8",
      sm: "h-6 w-6 text-xs",
      lg: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  }
})

export function UserAvatar({ user, size = "default" }: { user: User, size?: "default" | "sm" | "lg" }) {
  const initials = user.name.split(" ").map(name => name[0]).join("")

  return (
    <Avatar className={userAvatarVariants({ size })}>
      <AvatarImage src={user.imageUrl} alt={user.name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

const userNameVariants = cva("text-sm font-medium", {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  }
})

function UserName({ user, enableCopy = true, size = "default" }: { user: User, enableCopy?: boolean, size?: "default" | "sm" | "lg" }) {
  if (!enableCopy) {
    return <p className={userNameVariants({ size })}>{user.name}</p>
  }

  return (
    <CopyToClipboard textToCopy={user.name} className="cursor-pointer group" onClick={(e) => e.stopPropagation()}>
      <CopyUncopied>
        <p
          className={cn(
            userNameVariants({ size }),
            "text-left font-medium group-hover:text-primary transition-colors"
          )}
        >
          {user.name}
        </p>
      </CopyUncopied>
      <CopyCopied>
        <div className="flex items-center gap-1.5 text-green-600">
          <Check className="w-3.5 h-3.5" />
          <span
            className={cn(
              userNameVariants({ size }),
              "text-left font-medium group-hover:text-primary transition-colors"
            )}>
            Copied!
          </span>
        </div>
      </CopyCopied>
    </CopyToClipboard>
  )
}

const userEmailVariants = cva("text-xs text-left text-muted-foreground", {
  variants: {
    size: {
      default: "text-xs",
      sm: "text-xs",
      lg: "text-sm",
    },
  },
})

function UserEmail({ user, enableCopy = true, size = "default" }: { user: User, enableCopy?: boolean, size?: "default" | "sm" | "lg" }) {
  if (!enableCopy) {
    return <p className={userEmailVariants({ size })}>{user.email}</p>
  }

  return (
    <CopyToClipboard textToCopy={user.email} className="cursor-pointer group" onClick={(e) => e.stopPropagation()}>
      <CopyUncopied>
        <p
          className={cn(
            userEmailVariants({ size }),
            "text-left text-muted-foreground group-hover:text-foreground transition-colors"
          )}
        >
          {user.email}
        </p>
      </CopyUncopied>
      <CopyCopied>
        <div className="flex items-center gap-1.5 text-green-600">
          <Check className="w-3.5 h-3.5" />
          <span
            className={cn(
              userEmailVariants({ size }),
              "text-left font-medium group-hover:text-primary transition-colors"
            )}>
            Copied!
          </span>
        </div>
      </CopyCopied>
    </CopyToClipboard>
  )
}