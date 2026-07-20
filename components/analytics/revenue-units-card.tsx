import { RevenueUnitsChart } from "@/components/charts/revenue-units-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyTrend } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function RevenueUnitsCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const dailyTrend = await getDailyTrend(datasetId, range);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue &amp; units</CardTitle>
      </CardHeader>
      <CardContent>
        <RevenueUnitsChart data={dailyTrend} />
      </CardContent>
    </Card>
  );
}
