"use client"

import { User } from "@/common/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CopyCopied, CopyToClipboard, CopyUncopied } from "@/components/ui/copy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn, featureUnderDevelopment } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Check, Copy, MoreHorizontal } from "lucide-react"

export const usersTableColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name_email",
    accessorFn: (row) => `${row.name} ${row.email}`,
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      const initials = user.name.split(" ").map(name => name[0]).join("")

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "isOnline",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", user.isOnline ? "bg-green-500" : "bg-red-500")} />
          <span className="text-xs text-muted-foreground">{user.isOnline ? "Online" : "Offline"}</span>
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex justify-end w-full">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-3xs">
            <CopyToClipboard textToCopy={user._id} className="w-full h-full">
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <CopyUncopied>
                  <span className="flex items-center gap-2">
                    <Copy className="h-2 w-2 text-foreground" />
                    Copy user ID
                  </span>
                </CopyUncopied>
                <CopyCopied>
                  <div className="flex items-center gap-2">
                    <Check className="h-2 w-2 text-foreground" />
                    Copied
                  </div>
                </CopyCopied>
              </DropdownMenuItem>
            </CopyToClipboard>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => featureUnderDevelopment()}
            >Edit user</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => featureUnderDevelopment()}
            >Deactivate user</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => featureUnderDevelopment()}
            >Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]