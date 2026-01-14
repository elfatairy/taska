'use client'

import { Button } from "@/common/components/ui/button";
import { FieldGroup } from "@/common/components/ui/field";
import { useNewTeamForm } from "@/features/team/hooks/useNewTeamForm";
import { slugify } from "@convex/utils/slugify";

export function NewTeamFormDetailsStep({ form, defaultSlug, setDefaultSlug, nextStep }: {
  form: ReturnType<typeof useNewTeamForm>['form'],
  defaultSlug: string | null,
  setDefaultSlug: (slug: string) => void,
  nextStep: () => void
}) {
  return (
    <>
      <div className="mb-4 gap-1 flex flex-col">
        <h2 className="text-lg leading-none font-semibold">New Team</h2>
        <p className="text-muted-foreground text-sm">Add a new team to the system. You can add members to the team later.</p>
      </div>

      <div className="grid gap-4 py-4">
        <FieldGroup>
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" placeholder="Enter a name for the team" onChange={(e) => {
              setDefaultSlug(slugify(e.target.value));
            }} />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" placeholder="Describe the team in a few sentences" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => <field.EditableTextField label="Slug" placeholder={defaultSlug ?? "Enter a slug for the team"} />}
          </form.AppField>
        </FieldGroup>
      </div>
      <div className="mt-3">
        <Button onClick={nextStep} type="button">Next</Button>
      </div>
    </>
  )
}