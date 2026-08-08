"use client";

import {
  MessageSquareIcon,
  PackageIcon,
  ReceiptIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadCsv } from "@/app/actions/imports";
import { ImportChoiceCard } from "@/components/imports/import-choice-card";
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
    </div>
  );
}
