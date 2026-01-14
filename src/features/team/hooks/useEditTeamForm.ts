'use client'

import { useAccountMutation } from "@/features/account/useAccount";
import { useAppForm } from "@/hooks/form";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";
import type { TeamDetail } from "@/features/team/types";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  slug: z.string(),
  teamLeadId: z.string().nullable(),
})

export function useEditTeamForm({ team }: { team: TeamDetail }) {
  const updateTeam = useAccountMutation(api.team.updateTeam);
  const [successData, setSuccessData] = useState<{ success: boolean } | null>(null);
  const [error, setError] = useState<string | null>();

  const form = useAppForm({
    defaultValues: {
      name: team.name,
      description: team.description,
      slug: team.slug,
      teamLeadId: team.team_lead_id ?? null as string | null,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const updatedTeam: {
        name: string;
        description: string;
        slug: string | null;
        teamLeadId?: string;
      } = {
        name: value.name,
        description: value.description,
        slug: value.slug,
      }
      if (value.teamLeadId && value.teamLeadId !== "none") {
        updatedTeam.teamLeadId = value.teamLeadId;
      }
      const updateTeamResult = await updateTeam({
        teamId: team._id,
        team: updatedTeam
      });
      if (isFailure(updateTeamResult)) {
        setError(updateTeamResult.error);
        return;
      }
      
      setSuccessData({ success: true });
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
    error
  }
}