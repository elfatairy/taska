import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/common/components/ui/dialog";
import { FieldGroup } from "@/common/components/ui/field";
import { ROLES } from "@convex/utils/constants";
import { featureUnderDevelopment } from "@/lib/utils";
import { useNewUserForm } from "@/features/user/hooks/useNewUserForm";

export function NewUserForm({ form }: { form: ReturnType<typeof useNewUserForm>['form'] }) {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <DialogHeader>
        <DialogTitle>New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system. Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="firstName">
              {(field) => <field.TextField label="First Name" placeholder="John" autoComplete="nope" />}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => <field.TextField label="Last Name" placeholder="Doe" autoComplete="nope" />}
            </form.AppField>
          </div>
          <form.AppField name="email">
            {(field) => <field.TextField label="Email" placeholder="john.doe@example.com" autoComplete="nope" />}
          </form.AppField>
          <form.AppField name="role">
            {(field) => <field.Combobox label="Role" options={ROLES.map((role) => ({ value: role, label: role }))} placeholder="Select role" emptyMessage="No role found" />}
          </form.AppField>
          <form.AppField name="requirePasswordChange">
            {(field) => <field.Checkbox label="Require Password Change" disabled onClick={() => featureUnderDevelopment()} />}
          </form.AppField>
        </FieldGroup>
      </div>
      <DialogFooter>
        <form.AppForm>
          <form.SubscribeButton
            loadingLabel="Creating..."
            label={"Create"}
          />
        </form.AppForm>
      </DialogFooter>
    </form>
  )
}
