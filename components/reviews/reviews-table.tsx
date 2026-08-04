"use client";

import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { DataTableLinkPagination } from "@/components/data-table/data-table-link-pagination";
import { DataTableSortHeader } from "@/components/data-table/data-table-sort-header";
import { RecordFilters } from "@/components/data-table/record-filters";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useQueryParams } from "@/hooks/use-query-params";

type ProductOption = { id: string; name: string; sku: string };

type SentimentLabel = "positive" | "negative" | "neutral";

type ProductReviewSummary = {
  productId: string;
  productName: string;
  productSku: string;
  reviewCount: number;
  latestReviewDate: string | null;
};

type ReviewRow = {
  id: string;
  productId: string;
  reviewDate: string | null;
  reviewText: string;
  rating: number | null;
  sentimentLabel: SentimentLabel | null;
  sentimentScore: string | null;
};

type ReviewsTableProps = {
  rows: ProductReviewSummary[];
  reviewsByProduct: Record<string, ReviewRow[]>;
  products: ProductOption[];
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters: Record<string, string | undefined>;
  hasAnyRecords: boolean;
  currentSort: string;
  currentDir: "asc" | "desc";
  currentSentiment?: string;
  semanticError?: string;
};

const SENTIMENT_OPTIONS = [
  { value: "", label: "All sentiment" },
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
  { value: "neutral", label: "Neutral" },
];

const SENTIMENT_BADGE_VARIANT: Record<
  SentimentLabel,
  "secondary" | "destructive" | "outline"
> = {
  positive: "secondary",
  negative: "destructive",
  neutral: "outline",
};

export function ReviewsTable({
  rows,
  reviewsByProduct,
  products,
  page,
  pageCount,
  total,
  pathname,
  filters,
  hasAnyRecords,
  currentSort,
  currentDir,
  currentSentiment,
  semanticError,
}: ReviewsTableProps) {
  const { updateParams } = useQueryParams();

  if (!hasAnyRecords) {
    return (
      <Empty className="mt-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareTextIcon />
          </EmptyMedia>
          <EmptyTitle>No reviews yet</EmptyTitle>
          <EmptyDescription>
            Import a reviews CSV to see customer reviews and sentiment here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RecordFilters
          dateRange
          products={products}
          search
          searchPlaceholder="Search by product name or SKU..."
          semanticSearch
        />
        <DataTableFilter
          onValueChange={(value) =>
            updateParams({ sentiment: value || undefined }, "push")
          }
          options={SENTIMENT_OPTIONS}
          placeholder="All sentiment"
          value={currentSentiment ?? ""}
        />
      </div>

      {semanticError ? (
        <p className="mt-4 text-destructive text-sm">{semanticError}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-4 px-3 py-2 text-muted-foreground text-xs">
        <span className="flex-1">
          <DataTableSortHeader
            currentDir={currentDir}
            currentSort={currentSort}
            field="productName"
            label="Product"
            params={filters}
            pathname={pathname}
          />
        </span>
        <DataTableSortHeader
          currentDir={currentDir}
          currentSort={currentSort}
          field="reviewCount"
          label="Reviews"
          params={filters}
          pathname={pathname}
        />
        <DataTableSortHeader
          currentDir={currentDir}
          currentSort={currentSort}
          field="latestReviewDate"
          label="Latest"
          params={filters}
          pathname={pathname}
        />
      </div>

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((product) => (
            <Collapsible
              className="group rounded-md border"
              key={product.productId}
            >
              <CollapsibleTrigger
                render={
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50"
                    type="button"
                  />
                }
              >
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-90" />
                <span className="flex-1 truncate font-medium text-sm">
                  {product.productName}
                </span>
                <span className="font-mono text-muted-foreground text-xs">
                  {product.productSku}
                </span>
                <Badge variant="outline">
                  {product.reviewCount}{" "}
                  {product.reviewCount === 1 ? "review" : "reviews"}
                </Badge>
                <span className="w-24 text-muted-foreground text-xs">
                  {product.latestReviewDate ?? "—"}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <ul className="divide-y">
                  {(reviewsByProduct[product.productId] ?? []).map((review) => (
                    <li
                      className="flex flex-wrap items-start gap-3 px-3 py-2"
                      key={review.id}
                    >
                      <span className="w-24 shrink-0 text-muted-foreground text-xs">
                        {review.reviewDate ?? "—"}
                      </span>
                      <span className="w-10 shrink-0 text-xs">
                        {review.rating ? `${review.rating}/5` : "—"}
                      </span>
                      <p className="min-w-40 flex-1 text-sm">
                        {review.reviewText}
                      </p>
                      <span className="shrink-0">
                        {review.sentimentLabel ? (
                          <Badge
                            variant={
                              SENTIMENT_BADGE_VARIANT[review.sentimentLabel]
                            }
                          >
                            {review.sentimentLabel}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground text-sm">
          No reviews match these filters.
        </p>
      )}

      <DataTableLinkPagination
        filters={filters}
        page={page}
        pageCount={pageCount}
        pathname={pathname}
        total={total}
      />
    </div>
  );
}
