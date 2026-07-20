import { NoDataMessage } from "@/components/analytics/no-data-message";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryBreakdown } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function CategoryBreakdownCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const breakdown = await getCategoryBreakdown(datasetId, range);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by category</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length > 0 ? (
          <CategoryBreakdownChart data={breakdown} />
        ) : (
          <NoDataMessage message="No sales recorded for this period." />
        )}
      </CardContent>
    </Card>
  );
}
