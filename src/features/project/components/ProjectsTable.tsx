"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/features/account/useAccount"
import { Project } from "./ProjectsTableColumns"
import { ProjectsTableSkeleton } from "./ProjectsTableSkeleton"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useUserRole } from "@/hooks/useUserRole"
import { ProjectAssignTeamsDialog, useShouldOpenProjectAssignTeamsDialog } from "./ProjectAssignTeamsDialog"
import { ProjectId } from "../types"

interface ProjectsTableProps {
  columns: ColumnDef<Project>[]
}

export function ProjectsTable({
  columns,
}: ProjectsTableProps) {
  const userRole = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResult = useAccountQuery(api.project.getProjects);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const projectAssignTeamsDialog = useShouldOpenProjectAssignTeamsDialog();
  const [openProjectAssignTeamsDialog, setOpenProjectAssignTeamsDialog] = useState(projectAssignTeamsDialog);
  const [projectAssignTeamsProjectId, setProjectAssignTeamsProjectId] = useState<ProjectId | null>(searchParams.get("projectId") as ProjectId ?? null);

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
    meta: {
      handleOpenProjectAssignTeamsDialog,
    },
  })

  if (!queryResult) {
    return <ProjectsTableSkeleton />;
  }

  if (queryResult.error) {
    throw new Error(queryResult.error);
  }

  function handleOpenProjectAssignTeamsDialog(projectId: ProjectId) {
    setOpenProjectAssignTeamsDialog(true);
    setProjectAssignTeamsProjectId(projectId);
  }

  function handleCloseProjectAssignTeamsDialog() {
    setOpenProjectAssignTeamsDialog(false);
    setProjectAssignTeamsProjectId(null);
  }

  return (
    <>
      {projectAssignTeamsProjectId && (
        <ProjectAssignTeamsDialog
          projectId={projectAssignTeamsProjectId}
          open={openProjectAssignTeamsDialog}
          onClose={handleCloseProjectAssignTeamsDialog}
        />
      )}
      <div className="overflow-hidden ">
        <div className="flex items-center justify-between p-4">
          <Input
            placeholder="Search by name or key..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            autoFocus
            className="max-w-sm w-full"
          />
          {userRole === "CTO" && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects/new">
                <PlusIcon className="w-4 h-4" />New Project
              </Link>
            </Button>
          )}
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
                  onClick={() => router.push(`/dashboard/projects/${row.original.slug}`)}
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