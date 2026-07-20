import { Badge } from "@/components/ui/badge";
import type { ProductClassification } from "@/lib/analytics/velocity";

const LABELS: Record<ProductClassification, string> = {
  "high-demand": "High demand",
  "slow-mover": "Slow mover",
  normal: "Normal",
  "no-data": "No sales data",
};

const VARIANTS: Record<
  ProductClassification,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "high-demand": "default",
  "slow-mover": "destructive",
  normal: "secondary",
  "no-data": "outline",
};

export function ClassificationBadge({
  classification,
}: {
  classification: ProductClassification;
}) {
  return (
    <Badge variant={VARIANTS[classification]}>{LABELS[classification]}</Badge>
  );
}
