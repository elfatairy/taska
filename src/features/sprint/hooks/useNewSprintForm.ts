'use client'

import { useAccountMutation } from "@/features/account/useAccount";
import { useAppForm } from "@/hooks/form";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";
import { Id } from "@convex/_generated/dataModel";
import { addDays } from "date-fns";

const getErrorMessage = (error: string): string => {
  const errorMessages: Record<string, string> = {
    NOT_AUTHENTICATED: "You must be logged in to create a sprint.",
    NOT_AUTHORIZED: "You don't have permission to create sprints for this project.",
    PROJECT_NOT_FOUND: "Project not found.",
    TEAM_NOT_FOUND: "Team not found.",
    TEAM_NOT_ASSIGNED_TO_PROJECT: "This team is not assigned to the project.",
    INVALID_DATE_RANGE: "End date must be after start date.",
    OVERLAPPING_SPRINT: "A sprint already exists for this team during the selected dates. Please choose different dates.",
  };
  return errorMessages[error] || `An error occurred: ${error}`;
};

const formSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  teamId: z.string().min(1, "Team is required"),
  goal: z.string().min(1, "Sprint goal is required"),
  start_date: z.date({
    error: "Start date is required",
  }),
  duration: z.number(),
})

export function useNewSprintForm({ projectId }: { projectId: Id<"projects"> }) {
  const createSprint = useAccountMutation(api.sprint.createSprint);
  const [successData, setSuccessData] = useState<{ sprintId: Id<"sprints"> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
      teamId: "",
      goal: "",
      start_date: null as Date | null,
      duration: 14,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const createSprintArgs: Parameters<typeof createSprint>[0] = {
        projectId,
        teamId: value.teamId as Id<"teams">,
        name: value.name,
        goal: value.goal,
        start_date: value.start_date!.getTime(),
        end_date: addDays(value.start_date!, value.duration).getTime(),
      }

      const createSprintResult = await createSprint(createSprintArgs);
      
      if (isFailure(createSprintResult)) {
        setError(getErrorMessage(createSprintResult.error));
        return;
      }
      
      setSuccessData({ sprintId: createSprintResult.data.sprintId });
      setError(null);
    },
  })

  const reset = () => {
    form.reset()
    setSuccessData(null)
    setError(null)
  }

  return {
    form,
    successData,
    reset,
    error,
  }
}
