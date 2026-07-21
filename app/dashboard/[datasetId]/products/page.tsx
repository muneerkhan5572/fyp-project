import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { BackLink } from "@/components/dashboard/back-link";
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
      <BackLink href={`/dashboard/${dataset.id}`} label="Overview" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-semibold text-2xl">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage this dataset's product catalog.
          </p>
        </div>
        {products.length > 0 ? (
          <GenerateForecastButton
            datasetId={dataset.id}
            hasExistingForecast={hasForecast}
          />
        ) : null}
      </div>
      <div className="mt-6">
        <ProductsTable
          categories={categories}
          datasetId={dataset.id}
          products={products}
        />
      </div>
    </div>
  );
}
