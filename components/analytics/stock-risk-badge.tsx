import { Badge } from "@/components/ui/badge";
import type { StockRiskEntry } from "@/lib/analytics/stock-risk";

export function StockRiskBadge({
  stockRisk,
}: {
  stockRisk: StockRiskEntry | null;
}) {
  if (!stockRisk || stockRisk.status === "sufficient") {
    return null;
  }

  if (stockRisk.status === "out-of-stock") {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  return (
    <Badge variant="destructive">
      {stockRisk.daysRemaining} day{stockRisk.daysRemaining === 1 ? "" : "s"} of
      stock left
    </Badge>
  );
}
