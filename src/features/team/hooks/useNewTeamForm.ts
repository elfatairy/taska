'use client'

import { useAccountMutation } from "@/features/account/useAccount";
import { useAppForm } from "@/hooks/form";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  slug: z.string(),
  members: z.array(z.string().min(1)),
  teamLeadId: z.string().nullable(),
})


export function useNewTeamForm() {
  const createTeam = useAccountMutation(api.team.createTeam);
  const [successData, setSuccessData] = useState<Awaited<ReturnType<typeof createTeam>>['data']>(null);
  const [error, setError] = useState<string | null>();
  const [defaultSlug, setDefaultSlug] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      members: [] as string[],
      teamLeadId: null as null | string,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const team: {
        name: string;
        description: string;
        slug: string | null;
        membersIds: string[];
        teamLeadId?: string;
      } = {
        name: value.name,
        description: value.description,
        slug: value.slug || defaultSlug,
        membersIds: value.members,
      }
      if (value.teamLeadId) {
        team.teamLeadId = value.teamLeadId;
      }
      const createTeamResult = await createTeam({
        team,
      });
      if (isFailure(createTeamResult)) {
        setError(createTeamResult.error);
        return;
      }
      setSuccessData(createTeamResult.data);
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