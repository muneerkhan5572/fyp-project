"use client";

import {
  ArrowLeftIcon,
  PackageIcon,
  ReceiptIcon,
  ScanIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useState } from "react";
import { UploadFlexibleCard } from "@/components/imports/flexible/upload-flexible-card";
import { UploadCard } from "@/components/imports/upload-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ImportChoice = "products" | "sales" | "traffic" | "any-csv";

const CHOICES: {
  value: ImportChoice;
  label: string;
  hint: string;
  icon: typeof PackageIcon;
}[] = [
  {
    value: "products",
    label: "Products",
    hint: "Exact columns",
    icon: PackageIcon,
  },
  {
    value: "sales",
    label: "Sales",
    hint: "Exact columns",
    icon: ReceiptIcon,
  },
  {
    value: "traffic",
    label: "Traffic",
    hint: "Exact columns",
    icon: TrendingUpIcon,
  },
  {
    value: "any-csv",
    label: "Any CSV",
    hint: "Map your own columns (products + sales)",
    icon: ScanIcon,
  },
];

const CHOICE_LABEL: Record<ImportChoice, string> = {
  products: "Products",
  sales: "Sales",
  traffic: "Traffic",
  "any-csv": "Any CSV",
};

type ImportWizardProps = {
  datasetId: string;
};

export function ImportWizard({ datasetId }: ImportWizardProps) {
  const [selected, setSelected] = useState<ImportChoice | null>(null);

  if (!selected) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CHOICES.map((choice) => (
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            key={choice.value}
            onClick={() => setSelected(choice.value)}
          >
            <CardContent className="flex flex-col items-start gap-2">
              <choice.icon className="size-5 text-muted-foreground" />
              <p className="font-medium text-base">{choice.label}</p>
              <p className="text-muted-foreground text-xs">{choice.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Button
        className="mb-3 px-0"
        onClick={() => setSelected(null)}
        size="sm"
        variant="ghost"
      >
        <ArrowLeftIcon />
        {CHOICE_LABEL[selected]}
      </Button>
      {selected === "any-csv" ? (
        <UploadFlexibleCard datasetId={datasetId} />
      ) : (
        <UploadCard
          columns={COLUMNS[selected]}
          datasetId={datasetId}
          description={DESCRIPTIONS[selected]}
          templateHref={TEMPLATE_HREFS[selected]}
          title={CHOICE_LABEL[selected]}
          type={selected}
        />
      )}
    </div>
  );
}

const COLUMNS: Record<"products" | "sales" | "traffic", string[]> = {
  products: ["name", "sku", "category", "price", "cost", "stock"],
  sales: ["sku", "date", "quantity", "revenue"],
  traffic: ["sku", "date", "views"],
};

const DESCRIPTIONS: Record<"products" | "sales" | "traffic", string> = {
  products: "Create or update products by SKU.",
  sales: "Daily sales by SKU and date.",
  traffic: "Daily page views by SKU and date.",
};

const TEMPLATE_HREFS: Record<"products" | "sales" | "traffic", string> = {
  products: "/templates/products-template.csv",
  sales: "/templates/sales-template.csv",
  traffic: "/templates/traffic-template.csv",
};
