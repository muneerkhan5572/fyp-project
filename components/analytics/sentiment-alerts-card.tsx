import Link from "next/link";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatasetSentimentAlerts } from "@/lib/analytics/sentiment";

export async function SentimentAlertsCard({
  datasetId,
}: {
  datasetId: string;
}) {
  const alerts = (await getDatasetSentimentAlerts(datasetId)).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Negative sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <NoDataMessage message="No products with negative sentiment right now." />
        ) : (
          <ul className="space-y-2">
            {alerts.map((entry) => (
              <li
                className="relative flex items-center justify-between gap-2 text-sm"
                key={entry.productId}
              >
                <Link
                  className="truncate underline-offset-2 after:absolute after:inset-0 hover:underline"
                  href={`/dashboard/${datasetId}/products/${entry.productId}`}
                >
                  {entry.name}
                </Link>
                <span className="shrink-0 text-muted-foreground text-xs">
                  {entry.reviewCount} review{entry.reviewCount === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
