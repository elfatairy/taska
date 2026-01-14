import { useFieldContext } from "@/common/hooks/formContext";
import { useStore } from "@tanstack/react-form";
import { ErrorMessages } from "@/common/components/form-components";
import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { FieldLabel } from "@/common/components/ui/field";
import { ChevronDown, Minus, ChevronUp } from "lucide-react";
import { TASK_PRIORITY } from "@convex/utils/constants";

export function NewTaskFormPriorityRadio() {
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