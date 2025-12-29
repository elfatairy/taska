import { useAppForm } from "@/hooks/form";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { useAccountAction } from "@/features/account/useAccount";
import { z } from "zod";
import { ROLES } from "@convex/utils/constants";
import { isFailure } from "@convex/utils/types";

const formSchema = z.object({
  email: z.email(),
  role: z.enum(ROLES),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  requirePasswordChange: z.boolean(),
})

export function useNewUserForm() {
  const createUser = useAccountAction(api.user.createUser);
  const [successData, setSuccessData] = useState<{ password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: "",
      firstName: "",
      lastName: "",
      requirePasswordChange: false,     // TODO: ADD THE FUNCTIONALITY FOR THIS
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const createUserResult = await createUser({
        user: {
          name: `${value.firstName} ${value.lastName}`,
          email: value.email,
          role: value.role,
        },
      });
      if (isFailure(createUserResult)) {
        setError(createUserResult.error);
        return;
      }
      setSuccessData({ password: createUserResult.data });
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