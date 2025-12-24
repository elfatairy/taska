"use client"

import { usersTableColumns } from "@/features/user/components/UsersTableColumns";
import { UsersTable } from "@/features/user/components/UsersTable";
import { useConvexAuth } from "convex/react";
import UsersPageLoading from "./loading";
import { redirect } from "next/navigation";

export default function UsersPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <UsersPageLoading />;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 bg-card rounded-md">
        <UsersTable columns={usersTableColumns} />
      </div>
    </div>
  );
};