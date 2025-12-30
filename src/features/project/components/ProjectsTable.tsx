"use client"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { api } from "@convex/_generated/api"
import { useAccountQuery } from "@/features/account/useAccount"
import { Project } from "./ProjectsTableColumns"
import { ProjectsTableSkeleton } from "./ProjectsTableSkeleton"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

interface ProjectsTableProps {
  columns: ColumnDef<Project>[]
}

export function ProjectsTable({
  columns,
}: ProjectsTableProps) {
  const { user } = useUser();
  const router = useRouter();
  const queryResult = useAccountQuery(api.project.getProjects);
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
    return <ProjectsTableSkeleton />;
  }

  if (queryResult.error) {
    throw new Error(queryResult.error);
  }

  return (
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
        {user?.publicMetadata.role === "CTO" && (
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
  )
}