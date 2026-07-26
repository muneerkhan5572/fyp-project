import { NoDataMessage } from "@/components/analytics/no-data-message";
import { ProfitByProductChart } from "@/components/charts/profit-by-product-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopProductsByProfit } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function ProfitByProductCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const data = await getTopProductsByProfit(datasetId, range, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit by product</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ProfitByProductChart data={data} />
        ) : (
          <NoDataMessage message="No costed sales recorded for this period — add product costs to see profit here." />
        )}
      </CardContent>
    </Card>
  );
}
