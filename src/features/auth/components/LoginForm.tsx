"use client";

import { Google } from "@/common/components/icons";
import Github from "@/common/components/icons/Github";
import { OrSeparator } from "@/common/components/OrSeparator";
import { Button } from "@/common/components/ui/button";
import { FieldGroup } from "@/common/components/ui/field";
import { featureUnderDevelopment } from "@/lib/utils";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function LoginForm() {
  const { form, error } = useLoginForm();

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}>
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
          <Button 
            variant="link" 
            className="h-auto text-xs py-1 mt-2 text-muted-foreground font-normal" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              featureUnderDevelopment();
            }}
          >
            Forgot password?
          </Button>
        </div>
        {error && <p className="text-red-500 mt-1 text-xs pl-2">{error}</p>}
        <form.AppForm>
          <form.SubscribeButton label="Login" className="w-full mt-2" loadingLabel="Logging in..." />
        </form.AppForm>
      </form>

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