import { BackLink } from "@/components/dashboard/back-link";
import { UploadFlexibleCard } from "@/components/imports/flexible/upload-flexible-card";
import { ImportHistoryTable } from "@/components/imports/import-history-table";
import { UploadCard } from "@/components/imports/upload-card";
import { requireDataset } from "@/lib/datasets/dal";
import { listImports } from "@/lib/imports/dal";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const history = await listImports(dataset.id);

  return (
    <div>
      <BackLink href={`/dashboard/${dataset.id}`} label="Overview" />
      <div className="mt-2">
        <h1 className="font-semibold text-2xl">Import</h1>
        <p className="text-muted-foreground text-sm">
          Bulk-upload products, sales, or traffic data from a CSV file.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="font-medium text-lg">Any CSV</h2>
        <p className="text-muted-foreground text-sm">
          Import a CSV from anywhere else — a Kaggle dataset, an export from
          another tool — by mapping its columns to products and sales.
        </p>
        <div className="mt-3 max-w-2xl">
          <UploadFlexibleCard datasetId={dataset.id} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium text-lg">Exact template</h2>
        <p className="text-muted-foreground text-sm">
          Fastest path if your CSV already matches one of these templates.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <UploadCard
            columns={["name", "sku", "category", "price", "cost", "stock"]}
            datasetId={dataset.id}
            description="Create or update products by SKU."
            templateHref="/templates/products-template.csv"
            title="Products"
            type="products"
          />
          <UploadCard
            columns={["sku", "date", "quantity", "revenue"]}
            datasetId={dataset.id}
            description="Add or replace daily sales for existing products."
            templateHref="/templates/sales-template.csv"
            title="Sales"
            type="sales"
          />
          <UploadCard
            columns={["sku", "date", "views"]}
            datasetId={dataset.id}
            description="Add or replace daily page views for existing products."
            templateHref="/templates/traffic-template.csv"
            title="Traffic"
            type="traffic"
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium text-lg">Import history</h2>
        <ImportHistoryTable datasetId={dataset.id} imports={history} />
      </div>
    </div>
  );
}
