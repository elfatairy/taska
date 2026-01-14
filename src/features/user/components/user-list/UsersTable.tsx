"use client"

import { Input } from "@/common/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { NewUserDialog } from "../user-creation/NewUserDialog"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/common/hooks/useAccount"
import { UsersTableSkeleton } from "@/features/user/components/user-list/UsersTableSkeleton"
import { useRouter } from "next/navigation"
import { useShouldOpenNewUserDialog } from "../user-creation/NewUserDialog"
import { Button } from "@/common/components/ui/button"
import { PlusIcon } from "lucide-react"
import { User } from "@/common/types"

interface UsersTableProps {
  columns: ColumnDef<User>[]
}

export function UsersTable({
  columns,
}: UsersTableProps) {
  const router = useRouter();
  const queryResult = useAccountQuery(api.user.getUsers);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const shouldOpenNewUserDialog = useShouldOpenNewUserDialog();
  const [openNewUserDialog, setOpenNewUserDialog] = useState(shouldOpenNewUserDialog);

  function handleOpenNewUserDialog() {
    setOpenNewUserDialog(true);
  }

  function handleCloseNewUserDialog() {
    setOpenNewUserDialog(false);
  }
  
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
    <>
      <NewUserDialog
        open={openNewUserDialog}
        onClose={handleCloseNewUserDialog}
      />
      <div className="overflow-hidden ">
        <div className="flex items-center justify-between p-4">
          <Input
            placeholder="Search by name or email..."
            value={(table.getColumn("name_email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name_email")?.setFilterValue(event.target.value)
            }
            autoFocus
            className="max-w-sm w-full"
          />
          <Button variant="outline" onClick={handleOpenNewUserDialog}>
            <PlusIcon className="w-4 h-4" />New User
          </Button>
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
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/manage/users/${row.original.profile_slug}`)}
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
    </>
  )
}