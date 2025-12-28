'use client'

import { DialogFooter } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { useNewProjectForm } from "../hooks/useNewProjectForm";
import { ProductManagerComboBox } from "./ProductManagerComboBox";
import { NewProjectFormSuccess } from "./NewProjectFormSuccess";
import { Block } from "@/features/layout/components/Block";
import { useMemo } from "react";

export function NewProjectForm() {
  const { form, successData, error, defaultSlug, setDefaultSlug } = useNewProjectForm();
  

  if (successData) {
    return <NewProjectFormSuccess projectId={successData.projectId} projectName={successData.projectName} projectSlug={successData.projectSlug} />;
  }

  return (
    <Block>
      <form
        className="p-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="mb-4 gap-1 flex flex-col">
          <h2 className="text-lg leading-none font-semibold">New Project</h2>
          <p className="text-muted-foreground text-sm">Add a new project to the system. Fill in the details below.</p>
        </div>
        <FieldGroup className="mb-3">
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" placeholder="Enter a name for the project" onChange={(e) => {
              setDefaultSlug(e.target.value.toLowerCase().replace(/ /g, "-"));
            }} />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" placeholder="Describe the project in a few sentences" />}
          </form.AppField>
          <ProductManagerComboBox form={form} />
          <form.AppField name="key">
            {(field) => <field.TextField label="Key" placeholder="Enter a key for the project" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => <field.EditableTextField label="Slug" placeholder={defaultSlug ?? "Enter a slug for the project"} />}
          </form.AppField>
          <form.AppField name="start_date">
            {(field) => <field.DatePicker label="Start Date (optional)" placeholder="Select a start date" />}
          </form.AppField>
          <form.AppField name="target_date">
            {(field) => <field.DatePicker label="Target Date (optional)" placeholder="Select a target date" />}
          </form.AppField>
          <form.AppField name="icon">
            {(field) => <field.TextField label="Icon" placeholder="Enter an icon for the project" />}
          </form.AppField>
        </FieldGroup>
        {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
        <DialogFooter className="sm:justify-start">
          <form.AppForm>
            <div className="mt-3">
              <form.SubscribeButton label="Create Project" loadingLabel="Creating Project..." />
            </div>
          </form.AppForm>
        </DialogFooter>
      </form>
    </Block>
  )
}