import { useNewTaskForm } from "@/features/task/hooks/useNewTaskForm";
import { api } from "@convex/_generated/api";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/common/components/ui/dialog";
import { FieldGroup } from "@/common/components/ui/field";
import { Separator } from "@/common/components/ui/separator";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/common/components/ui/collapsible";
import { Button } from "@/common/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewTaskSkeleton } from "@/features/task/components/task-creation/NewTaskSkeleton";
import { NewTaskFormPriorityRadio } from "@/features/task/components/task-creation/NewTaskFormPriorityRadio";
import { ProjectId } from "@/common/types";

export function NewTaskForm({ form, projectId }: { form: ReturnType<typeof useNewTaskForm>['form'], projectId: ProjectId }) {
  const teamsQuery = useAccountQuery(api.project.getProjectTeams, { projectId });

  if (!teamsQuery) {
    return <NewTaskSkeleton />;
  }

  if (teamsQuery.error) {
    return <div className="text-red-500 text-sm">Error loading form data</div>; /** TODO: Show a proper error ui */
  }

  const teams = teamsQuery.data;

  const teamOptions = teams.map((team) => ({
    value: team._id,
    label: team.name,
  }));

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <DialogHeader>
        <DialogTitle>New Task</DialogTitle>
        <DialogDescription>
          Create a new task for the project. Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <FieldGroup>
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" placeholder="Enter task title" autoComplete="off" />}
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

          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" placeholder="Describe the task in detail" rows={4} />}
          </form.AppField>

          <div className="flex flex-col gap-2">
            <Separator />

            <NewTaskFormAdvancedOptions form={form} />
          </div>
        </FieldGroup>
      </div>
      <DialogFooter>
        <form.AppForm>
          <form.SubscribeButton
            loadingLabel="Creating..."
            label={"Create Task"}
          />
        </form.AppForm>
      </DialogFooter>
    </form>
  )
}

function NewTaskFormAdvancedOptions({ form }: { form: ReturnType<typeof useNewTaskForm>['form'] }) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9 -ml-2"
          size="sm"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", isAdvancedOpen && "rotate-90")} />
          Advanced Options
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <form.AppField name="acceptanceCriteria">
          {(field) => <field.TextArea label="Acceptance Criteria (Optional)" placeholder="Define what 'done' means for this task" rows={3} />}
        </form.AppField>

        <form.AppField name="estimate">
          {(field) => (
            <field.TextField
              label="Estimate (Story Points)"
              placeholder="0"
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                field.handleChange(value === "" ? 0 : Number(value));
              }}
            />
          )}
        </form.AppField>

        <form.AppField name="priority">
          {(field) => <NewTaskFormPriorityRadio />}
        </form.AppField>
      </CollapsibleContent>
    </Collapsible>
  )
}