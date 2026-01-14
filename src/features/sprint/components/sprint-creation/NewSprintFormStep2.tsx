import { Button } from "@/common/components/ui/button";
import { DialogFooter } from "@/common/components/ui/dialog";
import { FieldGroup } from "@/common/components/ui/field";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useStore } from "@tanstack/react-form";

export function NewSprintFormStep2({ 
  form, 
  onNext, 
  onBack 
}: { 
  form: ReturnType<typeof useNewSprintForm>['form'], 
  onNext: () => void,
  onBack: () => void 
}) {
  const goalField = useStore(form.store, (state) => state.values.goal);
  const canProceed = goalField && goalField.trim().length > 0;

  return (
    <>
      <FieldGroup>
        <form.AppField name="goal">
          {(field) => <field.TextArea label="Sprint Goal" placeholder="Describe what you want to achieve in this sprint" rows={6} />}
        </form.AppField>
      </FieldGroup>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </DialogFooter>
    </>
  )
}
