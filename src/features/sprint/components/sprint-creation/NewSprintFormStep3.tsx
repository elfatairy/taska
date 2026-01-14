import { Button } from "@/common/components/ui/button";
import { DialogFooter } from "@/common/components/ui/dialog";
import { useNewSprintForm } from "@/features/sprint/hooks/useNewSprintForm";
import { useStore } from "@tanstack/react-form";
import { addDays } from "date-fns";
import { Calendar, Users, Clock, CalendarCheck } from "lucide-react";

export function NewSprintFormStep3({ 
  form, 
  teams,
  onBack 
}: { 
  form: ReturnType<typeof useNewSprintForm>['form'], 
  teams: Array<{ _id: string; name: string }>,
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
