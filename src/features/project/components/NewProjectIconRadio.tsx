import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/field";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { ErrorMessages } from "@/components/form-components";
import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/form-context";
import { PROJECT_TYPES } from "@/features/project/types";
import { getProjectIcon } from "@/features/project/utils/getProjectIcon";

export function NewProjectIconRadio() {
  const field = useFieldContext<string>()
  const isSelected = (value: string) => field.state.value === value;
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div className="w-full space-y-2">
      <FieldLabel className="text-xs text-muted-foreground cursor-pointer">
        Project Type
      </FieldLabel>
      <RadioGroupPrimitive.RadioGroup
        value={field.state.value.toLowerCase()}
        onValueChange={field.handleChange}
        className="grid grid-cols-4 md:grid-cols-7 gap-3"
      >
        {PROJECT_TYPES.map((type) => {
          const selected = isSelected(type.value);

          return (
            <RadioGroupPrimitive.Item
              value={type.value.toLowerCase()}
              key={type.value}
              className={cn(
                "group flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer",
                "transition-all outline-none",
                selected && "border-primary bg-primary/5",
                !selected && "hover:border-primary/50 hover:bg-accent/50",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:bg-primary/10"
              )}
            >
              <Icon
                icon={getProjectIcon(type.value)}
                className={cn(
                  "w-8 h-8 transition-all",
                  "group-hover:scale-110 group-focus-visible:scale-110",
                  selected ? "scale-110 text-primary" : "text-muted-foreground",
                  "group-hover:text-foreground group-focus-visible:text-primary"
                )}
              />

              <span className={cn(
                "text-xs text-center transition-colors",
                selected ? "text-primary font-semibold" : "text-muted-foreground font-medium",
                "group-hover:text-foreground group-focus-visible:text-primary"
              )}>
                {type.label}
              </span>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.RadioGroup>
      {isInvalid && <ErrorMessages errors={errors} />}
    </div>
  );
}