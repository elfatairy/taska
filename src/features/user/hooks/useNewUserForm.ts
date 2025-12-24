import { useAppForm } from "@/hooks/form";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { useAccountAction } from "@/features/account/useAccount";
import { z } from "zod";
import { ROLES } from "@convex/utils/constants";

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
      const {data: password, error} = await createUser({
        user: {
          name: `${value.firstName} ${value.lastName}`,
          email: value.email,
          role: value.role,
        },
      });
      if (error) {
        setError(error);
        return;
      }
      setSuccessData({ password });
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