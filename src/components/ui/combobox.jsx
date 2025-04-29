"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


/**
 * A reusable combobox component.
 *
 * @param {object} props - The component props.
 * @param {Array<{ value: string, label: string, [key: string]: any }>} props.options - Array of options for the combobox. Each option must have 'value' and 'label'.
 * @param {string} [props.value] - The currently selected value.
 * @param {(value: string) => void} props.onValueChange - Callback function when the value changes.
 * @param {string} [props.placeholder="Select option..."] - Placeholder text for the trigger button.
 * @param {string} [props.searchPlaceholder="Search option..."] - Placeholder text for the search input.
 * @param {string} [props.emptyMessage="No option found."] - Message displayed when no options match the search.
 * @param {string} [props.triggerClassName] - Optional class name for the trigger button.
 * @param {string} [props.contentClassName] - Optional class name for the popover content.
 * @param {(option: { value: string, label: string, [key: string]: any }) => React.ReactNode} [props.renderOption] - Optional function to customize rendering of each option in the list.
 * @returns {React.ReactElement} The Combobox component.
 */
export function Combobox({
  options = [],
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  emptyMessage = "No option found.",
  triggerClassName,
  contentClassName,
  renderOption, // Add renderOption prop
}) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", triggerClassName)}
        >
          {selectedOption?.label ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[--radix-popover-trigger-width] p-0", contentClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
             <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // Use value for matching search
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue) // Use currentValue from onSelect
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {/* Use renderOption if provided, otherwise default to option.label */}
                  {renderOption ? renderOption(option) : option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
