"use client";

import {
  MessageSquareIcon,
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
import { ImportChoiceCard } from "@/components/imports/import-choice-card";
import { Card, CardContent } from "@/components/ui/card";
import { IMPORT_TYPE_LABELS } from "@/lib/imports/csv-config";
import type { ImportType } from "@/lib/imports/run-import";

const EXACT_CHOICES: {
  value: ImportType;
  hint: string;
  icon: typeof PackageIcon;
}[] = [
  { value: "products", hint: "Upload product file", icon: PackageIcon },
  { value: "sales", hint: "Upload sales file", icon: ReceiptIcon },
  { value: "traffic", hint: "Upload traffic file", icon: TrendingUpIcon },
  { value: "reviews", hint: "Upload reviews file", icon: MessageSquareIcon },
];

type ImportWizardProps = {
  datasetId: string;
};

export function ImportWizard({ datasetId }: ImportWizardProps) {
  const [showFlexible, setShowFlexible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadingType, setUploadingType] = useState<ImportType | null>(null);
  const inputRefs = useRef<Partial<Record<ImportType, HTMLInputElement>>>({});

  const handleFileSelected = (type: ImportType, file: File) => {
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
        <ImportChoiceCard
          disabled={isPending && uploadingType !== choice.value}
          hint={choice.hint}
          icon={choice.icon}
          inputRef={(element) => {
            inputRefs.current[choice.value] = element ?? undefined;
          }}
          isUploading={uploadingType === choice.value}
          key={choice.value}
          label={IMPORT_TYPE_LABELS[choice.value]}
          onFile={(file) => handleFileSelected(choice.value, file)}
        />
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
