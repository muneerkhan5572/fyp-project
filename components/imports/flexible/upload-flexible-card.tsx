"use client";

import { UploadIcon } from "lucide-react";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { MappingForm } from "@/components/imports/flexible/mapping-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { detectMapping } from "@/lib/imports/flexible/auto-detect";
import type {
  FieldKey,
  ImportMapping,
} from "@/lib/imports/flexible/mapping-schema";
import { cn } from "@/lib/utils";

const PREVIEW_ROW_COUNT = 20;

type PreviewState = {
  file: File;
  headers: string[];
  sampleRow: Record<string, string> | undefined;
  detectedMapping: ImportMapping;
  lowConfidenceFields: FieldKey[];
};

type UploadFlexibleCardProps = {
  datasetId: string;
};

export function UploadFlexibleCard({ datasetId }: UploadFlexibleCardProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      preview: PREVIEW_ROW_COUNT,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        if (headers.length === 0) {
          toast.error("Could not read any columns from that file.");
          resetInput();
          return;
        }
        const { mapping, lowConfidenceFields } = detectMapping(
          headers,
          result.data,
        );
        setPreview({
          file,
          headers,
          sampleRow: result.data[0],
          detectedMapping: mapping,
          lowConfidenceFields,
        });
      },
      error: () => {
        toast.error("Could not read that file.");
        resetInput();
      },
    });
  };

  if (preview) {
    return (
      <MappingForm
        datasetId={datasetId}
        detectedMapping={preview.detectedMapping}
        file={preview.file}
        headers={preview.headers}
        lowConfidenceFields={preview.lowConfidenceFields}
        onCancel={() => {
          setPreview(null);
          resetInput();
        }}
        sampleRow={preview.sampleRow}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flexible import (any CSV)</CardTitle>
        <CardDescription>
          Upload a CSV with your own column names and map them to products and
          sales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">
          Works with a single flat file — one row per sale, with a product name
          or SKU, price, date, and quantity. Revenue can be mapped or calculated
          automatically.
        </p>
      </CardContent>
      <CardFooter>
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer",
          )}
        >
          <UploadIcon />
          Choose CSV
          <input
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
        </label>
      </CardFooter>
    </Card>
  );
}
