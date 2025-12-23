import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <div className="overflow-hidden">
          {/* Search and Button Section */}
          <div className="flex items-center justify-between p-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Table Section */}
          <Table>
            <TableHeader className="border-t">
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}