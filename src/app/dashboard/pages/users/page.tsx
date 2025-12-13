import { columns, UsersTable } from "./UsersTable";
import { convexQuery } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";

export default async function UsersPage() {
  const data = await convexQuery(api.user.getUsers);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <UsersTable columns={columns} data={data} />
      </div>
    </div>
  );
};