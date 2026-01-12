'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Calendar, Users, Target, Clock, CalendarCheck } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { useAccountQuery } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@tanstack/react-form";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

export function useShouldOpenNewSprintDialog({ projectId }: { projectId?: Id<"projects"> } = {}) {
  const searchParams = useSearchParams();
  return searchParams.get("modal") === "new-sprint" && (!projectId || searchParams.get("projectId") === projectId);
}

export function NewSprintDialog({
  children,
  open,
  onClose,
  projectId,
}: {
  children?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  projectId: Id<"projects">,
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { form, successData, reset, error } = useNewSprintForm({ projectId })

  const handleUrlParams = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpen) {
      params.set("modal", "new-sprint");
      params.set("projectId", projectId);
    } else {
      params.delete("modal");
      params.delete("projectId");
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
            <NewSprintForm form={form} projectId={projectId} />
        }
      </DialogContent>
    </Dialog>
  )
}

function NewSprintForm({ form, projectId }: { form: ReturnType<typeof useNewSprintForm>['form'], projectId: Id<"projects"> }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const teamsQuery = useAccountQuery(api.project.getProjectTeams, { projectId });

  if (!teamsQuery) {
    return <NewSprintFormLoading />;
  }

  if (teamsQuery.error) {
    return <div className="text-red-500 text-sm">Error loading form data</div>; /** TODO: Show a proper error ui */
  }

  const teams = teamsQuery.data;

  const teamOptions = teams.map((team) => ({
    value: team._id,
    label: team.name,
  }));

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentStep === 3) {
        form.handleSubmit();
      }
    }}>
      <DialogHeader>
        <DialogTitle>New Sprint</DialogTitle>
        <DialogDescription>
          {currentStep === 1 && "Enter the sprint name, team, start date, and duration"}
          {currentStep === 2 && "Define what you want to achieve in this sprint"}
          {currentStep === 3 && "Review all details before creating the sprint"}
        </DialogDescription>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 pt-4">
          {[
            { num: 1, label: "Details" },
            { num: 2, label: "Goal" },
            { num: 3, label: "Review" }
          ].map((step) => (
            <div key={step.num} className={cn("flex items-center gap-2", step.num < 3 && "flex-1")}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  step.num < currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : step.num === currentStep 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step.num}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  step.num === currentStep 
                    ? "text-primary" 
                    : step.num < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </div>
              {step.num < 3 && (
                <div className={`h-0.5 w-full -mt-6 transition-colors ${
                  step.num < currentStep ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {currentStep === 1 && (
          <Step1Details form={form} teamOptions={teamOptions} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <Step2Goal form={form} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 3 && (
          <Step3Review form={form} teams={teams} onBack={handleBack} />
        )}
      </div>
    </form>
  )
}

function Step1Details({ 
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

function Step2Goal({ 
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

function Step3Review({ 
  form, 
  teams,
  onBack 
}: { 
  form: ReturnType<typeof useNewSprintForm>['form'], 
  teams: Array<{ _id: Id<"teams">; name: string }>,
  onBack: () => void 
}) {
  const values = useStore(form.store, (state) => state.values);
  const selectedTeam = teams.find((team) => team._id === values.teamId);

  return (
    <>
      <div className="space-y-4">
        {/* Sprint Name Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-1">{values.name}</h3>
          <p className="text-sm text-muted-foreground">Review your sprint configuration</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Team */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-accent/50">
            <div className="rounded-full bg-primary/10 p-2 mt-0.5">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Team</p>
              <p className="text-sm font-semibold text-foreground truncate">{selectedTeam?.name}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-accent/50">
            <div className="rounded-full bg-primary/10 p-2 mt-0.5">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
              <p className="text-sm font-semibold text-foreground">{values.duration} days</p>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-accent/50">
            <div className="rounded-full bg-green-500/10 p-2 mt-0.5">
              <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm font-semibold text-foreground">
                {values.start_date ? new Date(values.start_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : '-'}
              </p>
            </div>
          </div>

          {/* End Date */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-accent/50">
            <div className="rounded-full bg-red-500/10 p-2 mt-0.5">
              <CalendarCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">End Date</p>
              <p className="text-sm font-semibold text-foreground">
                {values.start_date 
                  ? addDays(values.start_date, values.duration).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Sprint Goal */}
        <div className="rounded-lg border bg-linear-to-br from-primary/5 to-primary/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold text-foreground">Sprint Goal</h4>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {values.goal}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <form.AppForm>
          <form.SubscribeButton
            loadingLabel="Creating..."
            label="Create Sprint"
          />
        </form.AppForm>
      </DialogFooter>
    </>
  )
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
        <h3 className="text-lg font-semibold">Sprint Created Successfully!</h3>
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

function NewSprintFormLoading() {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>New Sprint</DialogTitle>
        <DialogDescription>
          Create a new sprint for the project. Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Sprint Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Team field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Goal field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full" />
        </div>
        {/* Start and End Date fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Submit button */}
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}
