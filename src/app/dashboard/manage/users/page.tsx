"use client"

import { usersTableColumns } from "@/features/user/components/UsersTableColumns";
import { UsersTable } from "@/features/user/components/UsersTable";
import { useConvexAuth } from "convex/react";
import UsersPageLoading from "./loading";
import { redirect } from "next/navigation";
import { Block } from "@/features/layout/components/Block";

export default function UsersPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <UsersPageLoading />;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <Block>
      <UsersTable columns={usersTableColumns} />
    </Block>
  );
};