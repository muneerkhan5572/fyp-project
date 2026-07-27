import Link from "next/link";
import { notFound } from "next/navigation";
import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { StockRiskBadge } from "@/components/analytics/stock-risk-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeRestockRecommendation } from "@/lib/analytics/restock";
import { getStockRisk } from "@/lib/analytics/stock-risk";
import { classifyProducts } from "@/lib/analytics/velocity";
import { requireDataset } from "@/lib/datasets/dal";
import { datasetSectionHref } from "@/lib/datasets/routes";
import { getLatestForecast } from "@/lib/forecasts/dal";
import { getProduct } from "@/lib/products/dal";

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

export default async function ProductRestockPage({
  params,
}: {
  params: Promise<{ datasetId: string; productId: string }>;
}) {
  const { datasetId, productId } = await params;
  const dataset = await requireDataset(datasetId);

  const product = await getProduct(dataset.id, productId);
  if (!product) {
    notFound();
  }

  const [classified, stockRiskEntries, forecast] = await Promise.all([
    classifyProducts(dataset),
    getStockRisk(dataset.id),
    getLatestForecast(dataset.id, productId),
  ]);

  const classification = classified.find(
    (entry) => entry.productId === product.id,
  );
  const stockRisk =
    stockRiskEntries.find((entry) => entry.productId === product.id) ?? null;

  const windowDays = dataset.velocityWindowDays;
  const unitsInWindow = classification?.unitsInWindow ?? 0;
  const historicalVelocity = classification?.historicalVelocity ?? 0;

  const recommendation =
    product.stock === null
      ? null
      : computeRestockRecommendation(
          product.stock,
          forecast,
          historicalVelocity,
          windowDays,
        );

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[
              {
                label: "Products",
                href: datasetSectionHref(dataset.id, "products"),
              },
              {
                label: product.name,
                href: `/dashboard/${dataset.id}/products/${product.id}`,
              },
              { label: "Restock" },
            ]}
          />
        }
        description="Inventory and reorder guidance for this product."
        title={`Restock: ${product.name}`}
      />

      {product.stock === null ? (
        <Card>
          <CardContent className="py-6 text-muted-foreground text-sm">
            This product doesn't have a stock count yet. Add one on the{" "}
            <Link
              className="underline-offset-2 hover:underline"
              href={datasetSectionHref(dataset.id, "products")}
            >
              Products page
            </Link>{" "}
            to see inventory and reorder recommendations here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-2xl">
                {compactNumber.format(product.stock)} units
              </p>
              <div className="mt-2">
                <StockRiskBadge stockRisk={stockRisk} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Units sold</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-2xl">
                {compactNumber.format(unitsInWindow)} units
              </p>
              <p className="mt-2 text-muted-foreground text-xs">
                Over the last {windowDays} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reorder recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-2xl">
                {compactNumber.format(recommendation?.reorderQuantity ?? 0)}{" "}
                units
              </p>
              {recommendation?.source === "ml" ? (
                <p className="mt-2 text-muted-foreground text-xs">
                  Based on the AI demand forecast (next{" "}
                  {recommendation.horizonDays} days)
                </p>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs">
                    Estimated from recent sales velocity — generate a forecast
                    for an AI-based number.
                  </p>
                  <GenerateForecastButton
                    datasetId={dataset.id}
                    hasExistingForecast={Boolean(forecast)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
