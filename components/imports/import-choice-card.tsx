"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFileDrop } from "@/hooks/use-file-drop";
import { cn } from "@/lib/utils";

type ImportChoiceCardProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  isUploading: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
  inputRef: (element: HTMLInputElement | null) => void;
};

export function ImportChoiceCard({
  label,
  hint,
  icon: Icon,
  isUploading,
  disabled,
  onFile,
  inputRef,
}: ImportChoiceCardProps) {
  const { isDraggingOver, dropzoneProps } = useFileDrop(onFile, { disabled });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onFile(file);
  };

  return (
    <label
      className={cn(
        "flex cursor-pointer",
        disabled && "pointer-events-none opacity-50",
      )}
      {...dropzoneProps}
    >
      <Card
        className={cn(
          "w-full transition-colors hover:bg-muted/50",
          isDraggingOver && "bg-muted/50 ring-2 ring-primary",
        )}
      >
        <CardContent className="flex flex-col items-start gap-2">
          <Icon className="size-5 text-muted-foreground" />
          <p className="font-medium text-base">{label}</p>
          <p className="text-muted-foreground text-xs">
            {isUploading ? "Uploading..." : hint}
          </p>
        </CardContent>
      </Card>
      <input
        accept=".csv,text/csv"
        className="sr-only"
        disabled={disabled}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </label>
  );
}
