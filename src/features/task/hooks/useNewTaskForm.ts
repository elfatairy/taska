'use client'

import { useAccountMutation } from "@/features/account/useAccount";
import { useAppForm } from "@/hooks/form";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";
import { useState } from "react";
import { z } from "zod";
import { TASK_PRIORITY, TASK_STATUS } from "@convex/utils/constants";
import { Id } from "@convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  teamId: z.string().min(1, "Team is required"),
  description: z.string().min(1, "Description is required"),
  acceptanceCriteria: z.string(),
  priority: z.enum([...TASK_PRIORITY, ""]),
  estimate: z.number(),
})

export function useNewTaskForm({ projectId, status }: { projectId: Id<"projects">, status: typeof TASK_STATUS[number] }) {
  const createTask = useAccountMutation(api.task.createTask);
  const [successData, setSuccessData] = useState<{ taskId: Id<"tasks"> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      title: "",
      teamId: "",
      description: "",
      acceptanceCriteria: "" as string | null,
      priority: "" as typeof TASK_PRIORITY[number] | "",
      estimate: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const createTaskArgs: Parameters<typeof createTask>[0] = {
        projectId,
        teamId: value.teamId as Id<"teams">,
        title: value.title,
        description: value.description,
        status,
      }
      if (value.acceptanceCriteria) createTaskArgs.acceptanceCriteria = value.acceptanceCriteria;
      if (value.priority) createTaskArgs.priority = value.priority;
      if (value.estimate) createTaskArgs.estimate = value.estimate;

      const createTaskResult = await createTask(createTaskArgs);
      
      if (isFailure(createTaskResult)) {
        setError(createTaskResult.error);
        return;
      }
      
      setSuccessData({ taskId: createTaskResult.data.taskId });
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
