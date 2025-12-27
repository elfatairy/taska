import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '@/hooks/form-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { ComboboxProps } from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Combobox as ShadcnCombobox } from '@/components/ui/combobox'
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox'
import { DatePicker as ShadcnDatePicker } from '@/components/datePicker'
import { cn } from '@/lib/utils'

export function SubscribeButton({ label, loadingLabel, icon, className }: { label: string, loadingLabel?: string, icon?: React.ReactNode, className?: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting} className={cn("relative font-bold", className)}>
          {isSubmitting ? loadingLabel || label : label}
          {icon}
        </Button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 text-xs pl-2"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
  disabled,
  autoComplete,
  type,
}: {
  label?: string
  placeholder?: string
  disabled?: boolean
  autoComplete?: React.ComponentProps<'input'>['autoComplete']
  type?: React.ComponentProps<'input'>['type']
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className="w-full" data-invalid={isInvalid}>
      {
        label && <FieldLabel htmlFor={field.name} className='text-xs text-muted-foreground'>{label}</FieldLabel>
      }
      <Input
        id={field.name}
        name={field.name}
        disabled={disabled}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        autoComplete={autoComplete}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function TextArea({
  label,
  rows = 3,
  placeholder,
  disabled,
}: {
  label?: string
  rows?: number
  placeholder?: string
  disabled?: boolean
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className="w-full" data-invalid={isInvalid}>
      {
        label && <FieldLabel htmlFor={field.name} className='text-xs text-muted-foreground'>{label}</FieldLabel>
      }
      <ShadcnTextarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        disabled={disabled}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function Combobox({ label, options, placeholder, emptyMessage, loading }: ComboboxProps & { label?: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className="w-full" data-invalid={isInvalid}>
      {
        label && <FieldLabel htmlFor={field.name} className='text-xs text-muted-foreground'>{label}</FieldLabel>
      }
      <ShadcnCombobox
        id={field.name}
        name={field.name}
        options={options}
        onValueChange={(value) => field.handleChange(value)}
        placeholder={placeholder}
        loading={loading}
        emptyMessage={emptyMessage}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function Checkbox({ label, disabled, onClick }: { label?: string, disabled?: boolean, onClick?: () => void }) {
  const field = useFieldContext<'indeterminate' | true | false>()

  return (
    <Field className="w-full" orientation="horizontal" onClick={onClick}>
      <ShadcnCheckbox
        id={field.name}
        name={field.name}
        disabled={disabled}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        onBlur={field.handleBlur}
      />
      {label && <FieldLabel htmlFor={field.name} className='font-normal'>{label}</FieldLabel>}
    </Field>
  )
}

export function DatePicker({ label, disabled, placeholder }: { label?: string, disabled?: boolean, placeholder?: string }) {
  const field = useFieldContext<Date>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className="w-full" data-invalid={isInvalid}>
      {label && (
        <FieldLabel htmlFor={field.name} className="text-xs text-muted-foreground">
          {label}
        </FieldLabel>
      )}
      <ShadcnDatePicker
        id={field.name}
        dateValue={field.state.value}
        onChange={(date) => field.handleChange(date)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}