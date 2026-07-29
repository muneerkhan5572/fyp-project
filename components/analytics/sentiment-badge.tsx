import { Badge } from "@/components/ui/badge";
import type { ProductSentimentSummary } from "@/lib/analytics/sentiment";

export function SentimentBadge({
  sentiment,
}: {
  sentiment: ProductSentimentSummary;
}) {
  if (sentiment.scoredCount === 0 || sentiment.averageScore === null) {
    return null;
  }

  if (sentiment.averageScore < 0) {
    return <Badge variant="destructive">Negative sentiment</Badge>;
  }

  return <Badge variant="secondary">Positive sentiment</Badge>;
}
