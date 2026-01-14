'use client'

import { useAccountQuery } from "@/common/hooks/useAccount";
import { useNewProjectForm } from "@/features/project/hooks/useNewProjectForm";
import { api } from "@convex/_generated/api";
import { isFailure } from "@convex/utils/types";

export function ProductManagerComboBox({ form }: { form: ReturnType<typeof useNewProjectForm>['form'] }) {
  const projectManagers = useAccountQuery(api.user.getUsers, {
    role: "Product Manager",
  });

  const loading = projectManagers === undefined;

  if (isFailure(projectManagers)) {
    throw new Error(projectManagers.error);
  }

  const options = projectManagers?.data?.map((user) => ({ value: user._id, label: user.name })) || [];

  return (
    <form.AppField name="productManagerId">
      {(field) => <field.Combobox label="Product Manager" options={options} placeholder="Select a product manager" emptyMessage="No product managers found. Please add a product manager first." loading={loading} />}
    </form.AppField>
  )
}