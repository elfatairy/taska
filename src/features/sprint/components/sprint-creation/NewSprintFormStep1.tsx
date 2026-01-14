import { Button } from "@/common/components/ui/button";
import { DialogFooter } from "@/common/components/ui/dialog";
import { FieldGroup } from "@/common/components/ui/field";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useStore } from "@tanstack/react-form";

export function NewSprintFormStep1({ 
  form, 
  teamOptions, 
  onNext 
}: { 
  form: ReturnType<typeof useNewSprintForm>['form'], 
  teamOptions: { value: string; label: string }[],
  onNext: () => void 
}) {
  const nameField = useStore(form.store, (state) => state.values.name);
  const teamIdField = useStore(form.store, (state) => state.values.teamId);
  const startDateField = useStore(form.store, (state) => state.values.start_date);
  const durationField = useStore(form.store, (state) => state.values.duration);

  const canProceed = nameField && teamIdField && startDateField && durationField;

  return (
    <>
      <FieldGroup>
        <form.AppField name="name">
          {(field) => <field.TextField label="Sprint Name" placeholder="Enter sprint name (e.g., Sprint 1)" autoComplete="off" />}
        </form.AppField>

        <form.AppField name="teamId">
          {(field) => (
            <field.Combobox
              label="Team"
              options={teamOptions}
              placeholder="Select team"
              emptyMessage="No teams found"
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="start_date">
            {(startDateField) => <startDateField.DatePicker label="Start Date" placeholder="Select start date" />}
          </form.AppField>

          <form.AppField name="duration">
            {(durationField) => (
              <durationField.TextField
                label="Duration (days)"
                placeholder="Enter duration in days"
                type="number"
                min={1}
                max={365}
                onChange={(e) => {
                  if (e.target.value) {
                    durationField.handleChange(Math.max(1, Math.min(100, Number(e.target.value))));
                  }
                }}
              />
            )}
          </form.AppField>
        </div>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </DialogFooter>
    </>
  )
}
