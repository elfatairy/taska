"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, featureUnderDevelopment } from "@/lib/utils"
import { Doc } from "@convex/_generated/dataModel"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { Check, Copy, MoreHorizontal } from "lucide-react"
import { useState } from "react"

export const columns: ColumnDef<Doc<"users">>[] = [
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
    header: "Online",
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
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            <DropdownMenuItem>
              <CopyToClipboard textToCopy={user._id}>
                <span className="flex items-center gap-2">
                  <Copy className="h-2 w-2 text-foreground" />
                  Copy user ID
                </span>
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

const CopyToClipboard = ({ children, textToCopy }: { children: React.ReactNode, textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false)
  return (
    <button onClick={(e) => {
      e.preventDefault()
      navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }}>
      {isCopied ? (
        <div className="flex items-center gap-2">
          <Check className="h-2 w-2 text-foreground" />
          Copied
        </div>
      ) : children}
    </button>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function UsersTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  })

  return (
    <div className="overflow-hidden ">
      <div className="flex items-center p-4">
        <Input
          placeholder="Search by name or email..."
          value={(table.getColumn("name_email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name_email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm w-full"
        />
      </div>
      <Table>
        <TableHeader className="border-t">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}