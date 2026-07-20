import { NoDataMessage } from "@/components/analytics/no-data-message";
import { TrafficTrendChart } from "@/components/charts/traffic-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrafficTrend } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function TrafficCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const trafficTrend = await getTrafficTrend(datasetId, range);
  const hasData = trafficTrend.some((point) => point.views > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <TrafficTrendChart data={trafficTrend} />
        ) : (
          <NoDataMessage message="No traffic recorded for this period." />
        )}
      </CardContent>
    </Card>
  );
}
