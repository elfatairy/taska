import { useAppForm } from "@/common/hooks/form";
import { z } from "zod";
import { useAccountAction } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { useSignIn } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export function useLoginForm() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();
  const login = useAccountAction(api.auth.login);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema
    },
    onSubmitInvalid: () => {
      setError(null);
    },
    onSubmit: async ({ value, formApi }) => {
      setError(null);

      if (!isLoaded) {
        setError("An unexpected error occurred. Please try again later.");
        return;
      }

      const {data, error: loginError} = await login({
        email: value.email,
        password: value.password,
      });

      if (loginError === "INVALID_EMAIL_OR_PASSWORD") {
        setError("Invalid email or password");
        return;
      } else if (loginError) {
        setError("An unexpected error occurred. Please try again later.");
        return;
      }

      const { data: result, error: signInError } = await tryCatch(
        signIn.create({
          strategy: "ticket",
          ticket: data.token,
        })
      );

      if (signInError) {
        console.error(signInError);
        setError("Failed to login. Please try again later.");
        return;
      }

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/dashboard");
        setTimeout(() => {
          formApi.reset();
        }, 1000);
      }
    },
  });

  return { form, error };
}
