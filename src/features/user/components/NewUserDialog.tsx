import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROLES } from "@convex/utils/constants";
import { PlusIcon, CheckCircle2, Copy, Check } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";
import { featureUnderDevelopment } from "@/lib/utils";
import { CopyCopied, CopyToClipboard, CopyUncopied } from "@/components/ui/copy";
import { useNewUserForm } from "@/features/user/hooks/useNewUserForm";

export function NewUserDialog() {
  const { form, successData, reset } = useNewUserForm()

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        setTimeout(reset, 100);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline"><PlusIcon className="w-4 h-4" />New User</Button>
      </DialogTrigger>
      <DialogContent>
        {
          successData ?
            <FormSuccess successData={successData} isTemporaryPassword={form.state.values.requirePasswordChange} /> :
            <NewUserForm form={form} />
        }
      </DialogContent>
    </Dialog>
  )
}

function NewUserForm({ form }: { form: ReturnType<typeof useNewUserForm>['form'] }) {
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

function FormSuccess({ successData, isTemporaryPassword }: { successData: { password: string }, isTemporaryPassword: boolean }) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <DialogTitle className="text-2xl font-semibold">User Created Successfully!</DialogTitle>
          <DialogDescription className="text-base text-pretty">
            The user account has been created. Share this {isTemporaryPassword && 'temporary'} password with them.
          </DialogDescription>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{isTemporaryPassword && 'Temporary'} Password</label>
          <span className="text-xs text-muted-foreground">Click to copy</span>
        </div>
        <CopyToClipboard textToCopy={successData.password} className="relative group w-full">
          <div className="bg-muted/50 dark:bg-muted/30 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/70 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 p-4">
            <code className="text-lg font-mono font-semibold text-foreground tracking-wide text-left flex-1">
              {successData.password}
            </code>
            <div className="shrink-0">
              <CopyUncopied>
                <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CopyUncopied>
              <CopyCopied>
                <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
              </CopyCopied>
            </div>
          </div>
        </CopyToClipboard>
        <p className="text-xs text-muted-foreground text-center">
          This password will only be shown once. Make sure to save it securely.
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button className="w-full sm:w-auto">Done</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  )
}