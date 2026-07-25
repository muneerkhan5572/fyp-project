import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductsTable } from "@/components/products/products-table";
import { classifyProducts } from "@/lib/analytics/velocity";
import { requireDataset } from "@/lib/datasets/dal";
import { hasAnyForecast } from "@/lib/forecasts/dal";
import { listCategories, listProducts } from "@/lib/products/dal";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const [rawProducts, categories, classified, hasForecast] = await Promise.all([
    listProducts(dataset.id),
    listCategories(dataset.id),
    classifyProducts(dataset),
    hasAnyForecast(dataset.id),
  ]);

  const classificationByProductId = new Map(
    classified.map((product) => [product.productId, product.classification]),
  );
  const products = rawProducts.map((product) => ({
    ...product,
    classification: classificationByProductId.get(product.id) ?? "no-data",
  }));

  return (
    <div>
      <PageHeader
        actions={
          products.length > 0 ? (
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
          datasetId={dataset.id}
          products={products}
        />
      </div>
    </div>
  );
}
