import { ProjectId, Task } from "@/common/types";
import { ColumnFiltersState, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { projectBacklogTableColumns } from "../components/project-backlog/ProjectBacklogTableColumns";
import { useMemo, useState } from "react";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";

export function useProjectBacklogTable({ projectId }: { projectId: ProjectId }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tasksQuery = useAccountQuery(api.task.getTasksByProjectId, {
    projectId: projectId,
    filters: {
      status: ["BACKLOG", "TODO"],
    },
  });

  const tasks = tasksQuery?.data || [];

  const table = useReactTable({
    data: tasks,
    columns: projectBacklogTableColumns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        team_id: false,
      },
    },
    state: {
      columnFilters,
    },
  });

  const memoizedReturn = useMemo(() => {
    return { table };
  }, [table]);
  return memoizedReturn;
}
