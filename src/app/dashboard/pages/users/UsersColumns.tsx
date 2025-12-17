"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CopyCopied, CopyToClipboard, CopyTrigger } from "@/components/ui/copy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn, featureUnderDevelopment } from "@/lib/utils"
import { Doc } from "@convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"
import { Check, Copy, MoreHorizontal } from "lucide-react"

export type User = Doc<"users">

export const usersTableColumns: ColumnDef<Doc<"users">>[] = [
  {
    accessorKey: "name_email",
    accessorFn: (row) => `${row.name} ${row.email}`,
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name.split(" ")[0][0]}{user.name.split(" ")[1][0]}</AvatarFallback>
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
            <DropdownMenuItem>
              <CopyToClipboard>
                <CopyTrigger textToCopy={user._id}>
                  <span className="flex items-center gap-2">
                    <Copy className="h-2 w-2 text-foreground" />
                    Copy user ID
                  </span>
                </CopyTrigger>
                <CopyCopied>
                  <div className="flex items-center gap-2">
                    <Check className="h-2 w-2 text-foreground" />
                    Copied
                  </div>
                </CopyCopied>
              </CopyToClipboard>
            </DropdownMenuItem>
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