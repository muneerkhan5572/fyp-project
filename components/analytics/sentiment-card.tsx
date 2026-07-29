import { NoDataMessage } from "@/components/analytics/no-data-message";
import { Badge } from "@/components/ui/badge";
import { formatDateString } from "@/lib/analytics/range";
import type { ProductSentimentSummary } from "@/lib/analytics/sentiment";

export function SentimentCard({
  sentiment,
}: {
  sentiment: ProductSentimentSummary;
}) {
  if (sentiment.totalCount === 0) {
    return (
      <NoDataMessage message="No reviews yet — import a reviews CSV to see customer sentiment here." />
    );
  }

  const positivePercent =
    sentiment.scoredCount > 0
      ? Math.round((sentiment.positiveCount / sentiment.scoredCount) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {sentiment.scoredCount} of {sentiment.totalCount} review
          {sentiment.totalCount === 1 ? "" : "s"} scored
        </span>
        <span className="font-medium">
          {sentiment.positiveCount} positive · {sentiment.negativeCount}{" "}
          negative
        </span>
      </div>
      {sentiment.scoredCount > 0 ? (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-destructive/30">
          <div
            className="h-full bg-primary"
            style={{ width: `${positivePercent}%` }}
          />
        </div>
      ) : null}

      <ul className="mt-4 space-y-3">
        {sentiment.recentReviews.map((review) => (
          <li className="rounded-md border p-3 text-sm" key={review.id}>
            <div className="flex flex-wrap items-center gap-2">
              {review.sentimentLabel ? (
                <Badge
                  variant={
                    review.sentimentLabel === "positive"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {review.sentimentLabel}
                </Badge>
              ) : null}
              {review.rating !== null ? (
                <span className="text-muted-foreground text-xs">
                  {review.rating}/5
                </span>
              ) : null}
              {review.reviewDate ? (
                <span className="ml-auto text-muted-foreground text-xs">
                  {formatDateString(review.reviewDate)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-muted-foreground">{review.reviewText}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
