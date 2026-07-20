"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DataTableFilterOption = {
  value: string;
  label: string;
};

type DataTableFilterProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: DataTableFilterOption[];
  id?: string;
  placeholder?: string;
  "aria-invalid"?: boolean;
};

// A single-select dropdown filter. Deliberately built on DropdownMenu
// rather than the shadcn Select component — clicking a Select item
// reproducibly crashes the page with this project's @base-ui/react
// version (see feedback_base-ui-shadcn-nextjs16-gotchas memory).
export function DataTableFilter({
  value,
  onValueChange,
  options,
  id,
  placeholder = "Select...",
  "aria-invalid": ariaInvalid,
}: DataTableFilterProps) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-invalid={ariaInvalid}
            className="justify-between gap-2"
            id={id}
            variant="outline"
          />
        }
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
