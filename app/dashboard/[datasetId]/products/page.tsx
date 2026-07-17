import { ProductsTable } from "@/components/products/products-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listCategories, listProducts } from "@/lib/products/dal";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const [products, categories] = await Promise.all([
    listProducts(dataset.id),
    listCategories(dataset.id),
  ]);

  return (
    <div>
      <div>
        <h1 className="font-semibold text-2xl">Products</h1>
        <p className="text-muted-foreground text-sm">
          Manage this dataset's product catalog.
        </p>
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
