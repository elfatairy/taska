'use client'

import { useAccountAction, useAccountMutation, useAccountQuery } from "@/features/account/useAccount";
import { useAppForm } from "@/hooks/form";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  productManagerId: z.string().min(1),
  key: z.string().min(1),
  slug: z.string().min(1),
  start_date: z.date().nullable(),
  target_date: z.date().nullable(),
  icon: z.string().min(1),
})


export function useNewProjectForm() {
  const createProject = useAccountMutation(api.project.createProject);
  const [successData, setSuccessData] = useState<Awaited<ReturnType<typeof createProject>>['data']>(null);
  const [error, setError] = useState<string | null>();

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      productManagerId: "",
      key: "",
      slug: "",
      start_date: null as Date | null,
      target_date: null as Date | null,
      icon: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const createProjectResult = await createProject({
        project: {
          name: value.name,
          description: value.description,
          productManagerId: value.productManagerId,
          key: value.key,
          slug: value.slug,
          start_date: value.start_date ? value.start_date.getTime() : undefined,
          target_date: value.target_date ? value.target_date.getTime() : undefined,
        },
      });
      if (isFailure(createProjectResult)) {
        setError(createProjectResult.error);
        return;
      }
      setSuccessData(createProjectResult.data);
      setError(null);
    },
  })

  const reset = () => {
    form.reset()
    setSuccessData(null)
  }

  return {
    form,
    successData,
    reset,
    error,
  }
}