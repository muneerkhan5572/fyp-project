"use client";

import {
  PackageIcon,
  ReceiptIcon,
  ScanIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadCsv } from "@/app/actions/imports";
import { BackButton } from "@/components/dashboard/back-button";
import { UploadFlexibleCard } from "@/components/imports/flexible/upload-flexible-card";
import { Card, CardContent } from "@/components/ui/card";
import { IMPORT_TYPE_LABELS } from "@/lib/imports/csv-config";
import type { ImportType } from "@/lib/imports/run-import";
import { cn } from "@/lib/utils";

const EXACT_CHOICES: {
  value: ImportType;
  hint: string;
  icon: typeof PackageIcon;
}[] = [
  { value: "products", hint: "Upload product file", icon: PackageIcon },
  { value: "sales", hint: "Upload sales file", icon: ReceiptIcon },
  { value: "traffic", hint: "Upload traffic file", icon: TrendingUpIcon },
];

type ImportWizardProps = {
  datasetId: string;
};

export function ImportWizard({ datasetId }: ImportWizardProps) {
  const [showFlexible, setShowFlexible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadingType, setUploadingType] = useState<ImportType | null>(null);
  const inputRefs = useRef<Partial<Record<ImportType, HTMLInputElement>>>({});

  const handleFileChange = (
    type: ImportType,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingType(type);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadCsv(datasetId, formData);
      if (result?.error) {
        toast.error(result.error);
        setUploadingType(null);
        const input = inputRefs.current[type];
        if (input) {
          input.value = "";
        }
      }
    });
  };

  if (showFlexible) {
    return (
      <div>
        <BackButton
          className="mb-3"
          label="Any CSV"
          onClick={() => setShowFlexible(false)}
          variant="ghost"
        />
        <UploadFlexibleCard datasetId={datasetId} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {EXACT_CHOICES.map((choice) => (
        <label
          className={cn(
            "flex cursor-pointer",
            isPending &&
              uploadingType !== choice.value &&
              "pointer-events-none opacity-50",
          )}
          key={choice.value}
        >
          <Card className="w-full transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-start gap-2">
              <choice.icon className="size-5 text-muted-foreground" />
              <p className="font-medium text-base">
                {IMPORT_TYPE_LABELS[choice.value]}
              </p>
              <p className="text-muted-foreground text-xs">
                {uploadingType === choice.value ? "Uploading..." : choice.hint}
              </p>
            </CardContent>
          </Card>
          <input
            accept=".csv,text/csv"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => handleFileChange(choice.value, event)}
            ref={(element) => {
              inputRefs.current[choice.value] = element ?? undefined;
            }}
            type="file"
          />
        </label>
      ))}
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => setShowFlexible(true)}
      >
        <CardContent className="flex flex-col items-start gap-2">
          <ScanIcon className="size-5 text-muted-foreground" />
          <p className="font-medium text-base">Any CSV</p>
          <p className="text-muted-foreground text-xs">
            Map your own columns (products + sales)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
