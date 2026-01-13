"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, RowSelectionRow, RowSelectionState, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/features/account/useAccount"
import { Team } from "@/features/team/types"
import { TeamsTableSkeleton } from "@/features/team/components/TeamsTableSkeleton"
import { useRouter, useSearchParams } from "next/navigation"
import { TeamAssignToProjectDialog, useShouldOpenAssignToProjectDialog } from "./TeamAssignToProjectDialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { ChangeTeamLeadDialog, useShouldOpenChangeTeamLeadDialog } from "./ChangeTeamLeadDialog"
import { useUserRole } from "@/hooks/useUserRole"

interface TeamsTableProps {
  columns: ColumnDef<Team>[]
}

export function TeamsTable({
  columns,
}: TeamsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResult = useAccountQuery(api.team.getTeams);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

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
    meta: {
      handleOpenAssignToProjectDialog,
      handleOpenChangeTeamLeadDialog,
    },
  })

  const initialOpenAssignToProjectDialog = useShouldOpenAssignToProjectDialog();
  const [openAssignToProjectDialog, setOpenAssignToProjectDialog] = useState(initialOpenAssignToProjectDialog);
  const [assignToProjectTeamsIds, setAssignToProjectTeamsIds] = useState<Team['_id'][] | null>(searchParams.get("teamsIds")?.split(",") as Team['_id'][] ?? null);
  const initialOpenChangeTeamLeadDialog = useShouldOpenChangeTeamLeadDialog();
  const [openChangeTeamLeadDialog, setOpenChangeTeamLeadDialog] = useState(initialOpenChangeTeamLeadDialog);
  const [changeTeamLeadTeamId, setChangeTeamLeadTeamId] = useState<Team['_id'] | null>(searchParams.get("teamId") as Team['_id'] ?? null);
  const userRole = useUserRole();

  if (!queryResult) {
    return <TeamsTableSkeleton />;
  }

  if (queryResult.error) {
    throw new Error(queryResult.error);
  }

  const selectedTeamsIds = Object.keys(rowSelection).map((key) => data[Number(key)]._id);

  function handleOpenAssignToProjectDialog(teamsIds: Team['_id'][]) {
    setAssignToProjectTeamsIds(teamsIds);
    setOpenAssignToProjectDialog(true);
  }
  function handleCloseAssignToProjectDialog() {
    setAssignToProjectTeamsIds(null);
    setOpenAssignToProjectDialog(false);
  }
  function handleOpenChangeTeamLeadDialog(teamId: Team['_id']) {
    setChangeTeamLeadTeamId(teamId);
    setOpenChangeTeamLeadDialog(true);
  }
  function handleCloseChangeTeamLeadDialog() {
    setChangeTeamLeadTeamId(null);
    setOpenChangeTeamLeadDialog(false);
  }

  return (
    <div className="overflow-hidden ">
      <TeamAssignToProjectDialog
        open={openAssignToProjectDialog}
        onClose={handleCloseAssignToProjectDialog}
        teamsIds={assignToProjectTeamsIds ?? selectedTeamsIds}
      />
      {changeTeamLeadTeamId && (
        <ChangeTeamLeadDialog
          open={openChangeTeamLeadDialog}
          onClose={handleCloseChangeTeamLeadDialog}
          teamId={changeTeamLeadTeamId}
        />
      )}

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
          <Button
            variant="outline"
            disabled={selectedTeamsIds.length === 0}
            onClick={() => handleOpenAssignToProjectDialog(selectedTeamsIds)}
          >
            Assign to project
          </Button>

          {
            userRole === "CTO" && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/manage/teams/new">
                  <PlusIcon className="w-4 h-4" />New Team
                </Link>
              </Button>
            )}
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
    </div >
  )
}
