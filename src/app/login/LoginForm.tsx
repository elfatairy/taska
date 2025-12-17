"use client";

import { Google } from "@/components/icons";
import Github from "@/components/icons/Github";
import { OrSeparator } from "@/components/OrSeparator";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/form";
import { featureUnderDevelopment } from "@/lib/utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

const useLoginForm = () => {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return form;
}

export function LoginForm() {
  const form = useLoginForm();

  return (
    <>
      <FieldGroup>
        <form.AppField name="email">
          {(field) => <field.TextField label="Email" placeholder="john.doe@example.com" autoComplete="nope" />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.TextField 
            label="Password" 
            placeholder="********" 
            autoComplete="nope" 
          />}
        </form.AppField>
      </FieldGroup>
        <div className="flex justify-end">
          <Button variant="link" className="h-auto text-xs py-1 mt-2 text-muted-foreground font-normal" onClick={() => featureUnderDevelopment()}>
            Forgot password?
          </Button>
        </div>
        <form.AppForm>
          <form.SubscribeButton label="Login" className="w-full mt-2" />
        </form.AppForm>

      <OrSeparator className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="outline" className="col-span-1" onClick={() => featureUnderDevelopment()}>
          <Github className="size-4" />
        </Button>
        <Button variant="outline" className="col-span-1" onClick={() => featureUnderDevelopment()}>
          <Google className="size-4" />
        </Button>
      </div>
    </>
  );
}