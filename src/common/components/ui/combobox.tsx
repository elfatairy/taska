"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/common/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/common/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover"

interface Option {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: Option[];
  placeholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  id?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  value: string;
}

export function Combobox({ options, placeholder, loading, emptyMessage, id, name, onValueChange, value: initialValue }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(initialValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          name={name}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            {loading ?
              <CommandEmpty>Loading...</CommandEmpty>
              : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          onValueChange?.(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )
            }
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
