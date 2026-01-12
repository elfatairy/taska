'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TASK_PRIORITY, TASK_STATUS } from "@convex/utils/constants";
import { CheckCircle2, ChevronDown, Minus, ChevronUp, Plus, Settings, ChevronRight } from "lucide-react";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { useNewTaskForm } from "@/features/task/hooks/useNewTaskForm";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/form-context";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { ErrorMessages } from "@/components/form-components";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

export function useShouldOpenNewTaskDialog({ projectId, teamId }: { projectId?: Id<"projects">, teamId?: Id<"teams"> } = {}) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "new-task" && (!projectId || searchParams.get("projectId") === projectId) && (!teamId || searchParams.get("teamId") === teamId);
}

export function NewTaskDialog({
  children,
  open,
  status,
  onClose,
  teamId,
  projectId,
}: {
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  projectId: Id<"projects">,
  teamId?: Id<"teams">,
  status: typeof TASK_STATUS[number],
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { form, successData, reset, error } = useNewTaskForm({ projectId, status })

  const handleUrlParams = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpen) {
      params.set("modal", "new-task");
      params.set("projectId", projectId);
      if (teamId) {
        params.set("teamId", teamId);
      }
    } else {
      params.delete("modal");
      params.delete("projectId");
      params.delete("teamId");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(reset, 100);
    }
    handleUrlParams(isOpen);
  }

  const handleUrlParamsEffect = useEffectEvent(handleUrlParams);
  useEffect(() => {
    if (open) handleUrlParamsEffect(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
        {
          successData ?
            <FormSuccess onClose={() => handleOpenChange(false)} /> :
            <NewTaskForm form={form} projectId={projectId} />
        }
      </DialogContent>
    </Dialog>
  )
}

function NewTaskForm({ form, projectId }: { form: ReturnType<typeof useNewTaskForm>['form'], projectId: Id<"projects"> }) {
  const teamsQuery = useAccountQuery(api.project.getProjectTeams, { projectId });

  if (!teamsQuery) {
    return <NewTaskFormLoading />;
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

function NewTaskFormPriorityRadio() {
  const field = useFieldContext<string>()
  const isSelected = (value: string) => field.state.value === value;
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const priorityConfig = {
    LOW: { icon: ChevronDown, color: "text-blue-500", label: "Low" },
    MEDIUM: { icon: Minus, color: "text-yellow-500", label: "Medium" },
    HIGH: { icon: ChevronUp, color: "text-red-500", label: "High" },
  }

  return (
    <div className="w-full space-y-2">
      <FieldLabel className="text-xs text-muted-foreground cursor-pointer">
        Priority
      </FieldLabel>
      <RadioGroupPrimitive.RadioGroup
        value={field.state.value}
        onValueChange={field.handleChange}
        className="grid grid-cols-3 gap-3"
      >
        {TASK_PRIORITY.map((priority) => {
          const selected = isSelected(priority);
          const config = priorityConfig[priority];
          const Icon = config.icon;

          return (
            <RadioGroupPrimitive.Item
              value={priority}
              key={priority}
              className={cn(
                "group flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer",
                "transition-all outline-none",
                selected && "border-primary bg-primary/5",
                !selected && "hover:border-primary/50 hover:bg-accent/50",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:bg-primary/10"
              )}
            >
              <Icon
                className={cn(
                  "w-8 h-8 transition-all",
                  config.color,
                  "group-hover:scale-110 group-focus-visible:scale-110",
                  selected && "scale-110"
                )}
              />

              <span className={cn(
                "text-xs text-center transition-colors",
                selected ? "text-primary font-semibold" : "text-muted-foreground font-medium",
                "group-hover:text-foreground group-focus-visible:text-primary"
              )}>
                {config.label}
              </span>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.RadioGroup>
      {isInvalid && <ErrorMessages errors={errors} />}
    </div>
  );
}

function FormSuccess({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Task Created Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
      <Button onClick={onClose} variant="outline" className="mt-2">
        Close Now
      </Button>
    </div>
  )
}

function NewTaskFormLoading() {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>New Task</DialogTitle>
        <DialogDescription>
          Create a new task for the project. Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Title field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Description field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* Acceptance Criteria field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        {/* Priority and Estimate fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Team field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Sprint field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Assignee field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Submit button */}
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}
