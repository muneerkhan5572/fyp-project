import Link from "next/link";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateString } from "@/lib/analytics/range";
import { getStockRisk } from "@/lib/analytics/stock-risk";

export async function StockRiskCard({ datasetId }: { datasetId: string }) {
  const risk = await getStockRisk(datasetId);
  const atRisk = risk
    .filter((entry) => entry.status !== "sufficient")
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "out-of-stock" ? -1 : 1;
      }
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
    })
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>At risk of stocking out</CardTitle>
      </CardHeader>
      <CardContent>
        {atRisk.length === 0 ? (
          <NoDataMessage message="No stock-out risk right now — add stock counts to your products and generate a forecast to see this here." />
        ) : (
          <ul className="space-y-2">
            {atRisk.map((entry) => (
              <li
                className="flex items-center justify-between gap-2 text-sm"
                key={entry.productId}
              >
                <Link
                  className="truncate underline-offset-2 hover:underline"
                  href={`/dashboard/${datasetId}/products/${entry.productId}`}
                >
                  {entry.name}
                </Link>
                <span className="shrink-0 text-muted-foreground text-xs">
                  {entry.status === "out-of-stock"
                    ? "Out of stock"
                    : `${entry.daysRemaining} day${entry.daysRemaining === 1 ? "" : "s"} left (~${formatDateString(entry.stockOutDate ?? "")})`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
