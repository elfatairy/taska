"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/features/account/useAccount"
import { Team } from "@/features/team/components/TeamsTableColumns"
import { TeamsTableSkeleton } from "@/features/team/components/TeamsTableSkeleton"
import { useRouter } from "next/navigation"
import { TeamAssignToProjectDialog, TeamAssignToProjectDialogTrigger } from "./TeamAssignToProjectDialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

interface TeamsTableProps {
  columns: ColumnDef<Team>[]
}

export function TeamsTable({
  columns,
}: TeamsTableProps) {
  const router = useRouter();
  const queryResult = useAccountQuery(api.team.getTeams);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({})

  const data = queryResult?.data || [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
  })

  if (!queryResult) {
    return <TeamsTableSkeleton />;
  }

  if (queryResult.error) {
    throw new Error(queryResult.error);
  }

  const selectedTeamsIds = table.getSelectedRowModel().rows.map((row) => row.original._id);

  return (
    <div className="overflow-hidden ">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Search by team name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          autoFocus
          className="max-w-sm w-full"
        />
        <div className="flex items-center gap-2">
          <TeamAssignToProjectDialog teamsIds={selectedTeamsIds}>
            <TeamAssignToProjectDialogTrigger>
              <Button variant="outline" disabled={selectedTeamsIds.length === 0}>
                Assign to project
              </Button>
            </TeamAssignToProjectDialogTrigger>
          </TeamAssignToProjectDialog>
          
          <Button variant="outline" asChild>
            <Link href="/dashboard/manage/teams/new">
              <PlusIcon className="w-4 h-4" />New Team
            </Link>
          </Button>
        </div>
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
                onClick={() => router.push(`/dashboard/manage/teams/${row.original.slug}`)}
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
