import { DialogHeader, DialogTitle, DialogDescription } from "@/common/components/ui/dialog";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useAccountQuery } from "@/common/hooks/useAccount";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import { ProjectId } from "@/common/types";
import { useState } from "react";
import { NewSprintSkeleton } from "./NewSprintSkeleton";
import { NewSprintFormStep1 } from "./NewSprintFormStep1";
import { NewSprintFormStep2 } from "./NewSprintFormStep2";
import { NewSprintFormStep3 } from "./NewSprintFormStep3";

export function NewSprintForm({ form, projectId }: { form: ReturnType<typeof useNewSprintForm>['form'], projectId: ProjectId }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const teamsQuery = useAccountQuery(api.project.getProjectTeams, { projectId });

  if (!teamsQuery) {
    return <NewSprintSkeleton />;
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
        {currentStep === 1 && <NewSprintFormStep1 form={form} teamOptions={teamOptions} onNext={handleNext} />}
        {currentStep === 2 && <NewSprintFormStep2 form={form} onNext={handleNext} onBack={handleBack} />}
        {currentStep === 3 && <NewSprintFormStep3 form={form} teams={teams} onBack={handleBack} />}
      </div>
    </form>
  )
}
