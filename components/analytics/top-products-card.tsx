import { NoDataMessage } from "@/components/analytics/no-data-message";
import { TopProductsChart } from "@/components/charts/top-products-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopProducts } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function TopProductsCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const [byRevenue, byUnits] = await Promise.all([
    getTopProducts(datasetId, range, "revenue", 10),
    getTopProducts(datasetId, range, "units", 10),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top products</CardTitle>
      </CardHeader>
      <CardContent>
        {byRevenue.length > 0 ? (
          <TopProductsChart byRevenue={byRevenue} byUnits={byUnits} />
        ) : (
          <NoDataMessage message="No sales recorded for this period." />
        )}
      </CardContent>
    </Card>
  );
}
