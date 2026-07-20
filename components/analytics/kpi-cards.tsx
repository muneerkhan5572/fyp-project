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
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardHeader>
            <CardTitle className="font-normal text-muted-foreground text-xs">
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
  return <KpiCards kpis={kpis} />;
}
