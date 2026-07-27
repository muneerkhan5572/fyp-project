import { NoDataMessage } from "@/components/analytics/no-data-message";
import { ConversionRateChart } from "@/components/charts/conversion-rate-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConversionTrend } from "@/lib/analytics/queries";
import type { DateRange } from "@/lib/analytics/range";

export async function ConversionRateCard({
  datasetId,
  range,
}: {
  datasetId: string;
  range: DateRange;
}) {
  const trend = await getConversionTrend(datasetId, range);
  const hasData = trend.some((point) => point.rate !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion rate</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <ConversionRateChart data={trend} />
            <p className="mt-2 text-muted-foreground text-xs">
              Units sold ÷ tracked views — can exceed 100% when units sold
              outpace tracked views.
            </p>
          </>
        ) : (
          <NoDataMessage message="No traffic recorded for this period." />
        )}
      </CardContent>
    </Card>
  );
}
