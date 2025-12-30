"use client"

import { useConvexAuth } from "convex/react";
import ProjectsPageLoading from "./loading";
import { Block } from "@/features/layout/components/Block";
import { redirect } from "next/navigation";
import { projectsTableColumns } from "@/features/project/components/ProjectsTableColumns";
import { ProjectsTable } from "@/features/project/components/ProjectsTable";

export default function ProjectsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <ProjectsPageLoading />;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <Block>
      <ProjectsTable columns={projectsTableColumns} />
    </Block>
  );
}