import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKpis, type Kpis } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

const decimalNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const percentNumber = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const tiles = [
    { label: "Total revenue", value: currency.format(kpis.totalRevenue) },
    { label: "Units sold", value: compactNumber.format(kpis.totalUnits) },
    {
      label: "Avg daily units",
      value: decimalNumber.format(kpis.avgDailyUnits),
    },
    { label: "Products", value: compactNumber.format(kpis.productCount) },
    {
      label: "Gross margin",
      value:
        kpis.marginPct === null ? "—" : percentNumber.format(kpis.marginPct),
    },
    { label: "Gross profit", value: currency.format(kpis.grossProfit) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardHeader>
            <CardTitle className="font-normal text-muted-foreground text-sm">
              {tile.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-2xl">{tile.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export async function KpiCardsSection({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const kpis = await getKpis(datasetId, range);
  const showCoverageCaveat =
    kpis.costedRevenuePct !== null && kpis.costedRevenuePct < 1;

  return (
    <div>
      <KpiCards kpis={kpis} />
      {showCoverageCaveat ? (
        <p className="mt-2 text-muted-foreground text-xs">
          Margin based on {Math.round((kpis.costedRevenuePct ?? 0) * 100)}% of
          revenue — some products are missing a cost.
        </p>
      ) : null}
    </div>
  );
}
