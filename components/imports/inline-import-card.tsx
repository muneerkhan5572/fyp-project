"use client";

import { ChevronDownIcon, UploadIcon } from "lucide-react";
import { UploadCard } from "@/components/imports/upload-card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IMPORT_COLUMNS,
  IMPORT_DESCRIPTIONS,
  IMPORT_TEMPLATE_HREFS,
  IMPORT_TYPE_LABELS,
} from "@/lib/imports/csv-config";
import type { ImportType } from "@/lib/imports/run-import";

type InlineImportCardProps = {
  datasetId: string;
  type: ImportType;
};

export function InlineImportCard({ datasetId, type }: InlineImportCardProps) {
  return (
    <Collapsible className="mb-6">
      <div className="flex justify-end">
        <CollapsibleTrigger
          render={
            <Button className="group" variant="outline">
              <UploadIcon />
              Import CSV
              <ChevronDownIcon className="transition-transform group-data-[panel-open]:rotate-180" />
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="mt-3">
        <UploadCard
          columns={IMPORT_COLUMNS[type]}
          datasetId={datasetId}
          description={IMPORT_DESCRIPTIONS[type]}
          templateHref={IMPORT_TEMPLATE_HREFS[type]}
          title={IMPORT_TYPE_LABELS[type]}
          type={type}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
