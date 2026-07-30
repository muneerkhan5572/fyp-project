import Link from "next/link";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMarketingRecommendations,
  type MarketingRecommendationType,
} from "@/lib/analytics/marketing-recommendations";
import type { Dataset } from "@/lib/db/schema";

const TYPE_LABELS: Record<MarketingRecommendationType, string> = {
  discount: "Discount",
  bundle: "Bundle",
  clearance: "Clearance",
  "fix-quality": "Fix quality",
};

const TYPE_VARIANTS: Record<
  MarketingRecommendationType,
  "secondary" | "destructive" | "outline"
> = {
  discount: "secondary",
  bundle: "secondary",
  clearance: "outline",
  "fix-quality": "destructive",
};

export async function MarketingRecommendationsCard({
  dataset,
}: {
  dataset: Dataset;
}) {
  const recommendations = await getMarketingRecommendations(dataset);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <NoDataMessage message="No marketing recommendations right now." />
        ) : (
          <ul className="space-y-3">
            {recommendations.map((entry) => (
              <li
                className="relative rounded-md border p-3 text-sm"
                key={entry.productId}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    className="truncate font-medium underline-offset-2 after:absolute after:inset-0 hover:underline"
                    href={`/dashboard/${dataset.id}/products/${entry.productId}`}
                  >
                    {entry.name}
                  </Link>
                  <Badge variant={TYPE_VARIANTS[entry.recommendation.type]}>
                    {TYPE_LABELS[entry.recommendation.type]}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {entry.recommendation.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
