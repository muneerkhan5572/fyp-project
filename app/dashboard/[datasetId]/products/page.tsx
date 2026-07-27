import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { ProductsTable } from "@/components/products/products-table";
import { classifyProducts } from "@/lib/analytics/velocity";
import { requireDataset } from "@/lib/datasets/dal";
import { hasAnyForecast } from "@/lib/forecasts/dal";
import {
  hasAnyProducts,
  listCategories,
  pagedProducts,
} from "@/lib/products/dal";
import { productsListParamsSchema } from "@/lib/validations/products";

type ProductsPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { datasetId } = await params;
  const { page, category, search, sort, dir } = productsListParamsSchema.parse(
    await searchParams,
  );
  const dataset = await requireDataset(datasetId);

  const [
    { rows: pagedRows, total, page: currentPage, pageCount, semanticError },
    categories,
    classified,
    hasForecast,
    anyProducts,
  ] = await Promise.all([
    pagedProducts(dataset.id, { page, category, search, sort, dir }),
    listCategories(dataset.id),
    classifyProducts(dataset),
    hasAnyForecast(dataset.id),
    hasAnyProducts(dataset.id),
  ]);

  const classificationByProductId = new Map(
    classified.map((product) => [product.productId, product.classification]),
  );
  const rows = pagedRows.map((product) => ({
    ...product,
    classification: classificationByProductId.get(product.id) ?? "no-data",
  }));

  return (
    <div>
      <PageHeader
        actions={
          anyProducts ? (
            <GenerateForecastButton
              datasetId={dataset.id}
              hasExistingForecast={hasForecast}
            />
          ) : null
        }
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: "Products" }]}
          />
        }
        description="Manage this dataset's product catalog."
        title="Products"
      />
      <div>
        <ProductsTable
          categories={categories}
          currentDir={dir}
          currentSort={sort}
          datasetId={dataset.id}
          filters={{ category, search, sort, dir }}
          hasAnyProducts={anyProducts}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/products`}
          rows={rows}
          semanticError={semanticError}
          total={total}
        />
      </div>
    </div>
  );
}
