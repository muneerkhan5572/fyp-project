"use client";

import { UploadIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadCsv } from "@/app/actions/imports";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFileDrop } from "@/hooks/use-file-drop";
import type { ImportType } from "@/lib/imports/run-import";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  datasetId: string;
  type: ImportType;
  title: string;
  description?: string;
  columns: string[];
  templateHref: string;
};

export function UploadCard({
  datasetId,
  type,
  title,
  description,
  columns,
  templateHref,
}: UploadCardProps) {
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);

    const formData = new FormData();
    formData.set("type", type);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadCsv(datasetId, formData);
      if (result?.error) {
        toast.error(result.error);
        setFileName(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    processFile(file);
  };

  const { isDraggingOver, dropzoneProps } = useFileDrop(processFile, {
    disabled: isPending,
  });

  return (
    <Card
      className={cn(isDraggingOver && "bg-muted/50 ring-2 ring-primary")}
      {...dropzoneProps}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">
          Columns: <span className="font-mono">{columns.join(", ")}</span>
        </p>
        {fileName ? (
          <p className="mt-2 text-xs">
            {isPending ? "Uploading" : "Selected"}: {fileName}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        <label
          className={cn(
            buttonVariants({ variant: "outline" }),
            "cursor-pointer",
            isPending && "pointer-events-none opacity-50",
          )}
        >
          <UploadIcon />
          {isPending ? "Uploading..." : "Upload CSV"}
          <input
            accept=".csv,text/csv"
            className="sr-only"
            disabled={isPending}
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
        </label>
        <a
          className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
          download
          href={templateHref}
        >
          Download template
        </a>
      </CardFooter>
    </Card>
  );
}
