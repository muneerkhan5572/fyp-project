import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { InlineImportCard } from "@/components/imports/inline-import-card";
import { ReviewsTable } from "@/components/reviews/reviews-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProductOptions } from "@/lib/products/dal";
import {
  hasAnyReviews,
  listReviewsForProducts,
  pagedReviewedProducts,
} from "@/lib/reviews/dal";
import { reviewsListParamsSchema } from "@/lib/validations/reviews";

type ReviewsPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReviewsPage({
  params,
  searchParams,
}: ReviewsPageProps) {
  const { datasetId } = await params;
  const {
    page,
    productId,
    from,
    to,
    search,
    searchMode,
    sentiment,
    sort,
    dir,
  } = reviewsListParamsSchema.parse(await searchParams);
  const dataset = await requireDataset(datasetId);

  const [
    { rows: productRows, total, page: currentPage, pageCount, semanticError },
    products,
    anyReviews,
  ] = await Promise.all([
    pagedReviewedProducts(dataset.id, {
      page,
      productId,
      from,
      to,
      search,
      searchMode,
      sentiment,
      sort,
      dir,
    }),
    listProductOptions(dataset.id),
    hasAnyReviews(dataset.id),
  ]);

  const reviewRows = await listReviewsForProducts(
    dataset.id,
    productRows.map((row) => row.productId),
    { from, to, sentiment },
  );

  const reviewsByProduct = new Map<string, typeof reviewRows>();
  for (const review of reviewRows) {
    const existing = reviewsByProduct.get(review.productId);
    if (existing) {
      existing.push(review);
    } else {
      reviewsByProduct.set(review.productId, [review]);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: "Reviews" }]}
          />
        }
        description="Browse customer reviews and sentiment for this dataset's products."
        title="Reviews"
      />
      <InlineImportCard datasetId={dataset.id} type="reviews" />
      <div>
        <ReviewsTable
          currentDir={dir}
          currentSentiment={sentiment}
          currentSort={sort}
          filters={{
            productId,
            from,
            to,
            search,
            searchMode,
            sentiment,
            sort,
            dir,
          }}
          hasAnyRecords={anyReviews}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/reviews`}
          products={products}
          reviewsByProduct={Object.fromEntries(reviewsByProduct)}
          rows={productRows}
          semanticError={semanticError}
          total={total}
        />
      </div>
    </div>
  );
}
