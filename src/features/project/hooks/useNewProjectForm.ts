'use client'

import { useAccountMutation } from "@/common/hooks/useAccount";
import { useAppForm } from "@/common/hooks/form";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";
import { PROJECT_TYPES } from "@convex/utils/constants";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  productManagerId: z.string().min(1),
  key: z.string().min(1),
  slug: z.string(),
  start_date: z.date().nullable(),
  target_date: z.date().nullable(),
  type: z.enum(PROJECT_TYPES),
})


export function useNewProjectForm() {
  const createProject = useAccountMutation(api.project.createProject);
  const [successData, setSuccessData] = useState<Awaited<ReturnType<typeof createProject>>['data']>(null);
  const [error, setError] = useState<string | null>();
  const [defaultSlug, setDefaultSlug] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      productManagerId: "",
      key: "",
      slug: "",
      start_date: null as Date | null,
      target_date: null as Date | null,
      type: "",
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
          slug: value.slug || defaultSlug,
          start_date: value.start_date ? value.start_date.getTime() : undefined,
          target_date: value.target_date ? value.target_date.getTime() : undefined,
          type: value.type,
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
    defaultSlug,
    setDefaultSlug
  }
}