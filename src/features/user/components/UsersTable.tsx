"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { NewUserDialog } from "./NewUserDialog"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/features/account/useAccount"
import { User } from "./UsersTableColumns"
import { UsersTableSkeleton } from "./UsersTableSkeleton"

interface UsersTableProps {
  columns: ColumnDef<User>[]
}

export function UsersTable({
  columns,
}: UsersTableProps) {
  const queryResult = useAccountQuery(api.user.getUsers);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const data = queryResult?.data || [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  })

  if (!queryResult) {
    return <UsersTableSkeleton />;
  }
  
  if (queryResult.error) {
    throw new Error(queryResult.error);
  }

  return (
    <div className="overflow-hidden ">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Search by name or email..."
          value={(table.getColumn("name_email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name_email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm w-full"
        />
        <NewUserDialog />
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