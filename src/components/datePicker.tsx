"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  name?: string
  dateValue?: Date
  onChange?: (date: Date) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({ id, dateValue, onChange, disabled, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={!dateValue}
          disabled={disabled}
          className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={dateValue} onSelect={(date) => date && onChange?.(date)}/>
      </PopoverContent>
    </Popover>
  )
}