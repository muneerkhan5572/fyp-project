import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { InlineImportCard } from "@/components/imports/inline-import-card";
import { SalesTable } from "@/components/sales/sales-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProducts } from "@/lib/products/dal";
import { hasAnySales, pagedSales } from "@/lib/sales/dal";
import { salesListParamsSchema } from "@/lib/validations/sales";

type SalesPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalesPage({
  params,
  searchParams,
}: SalesPageProps) {
  const { datasetId } = await params;
  const { page, productId, from, to, search, sort, dir } =
    salesListParamsSchema.parse(await searchParams);
  const dataset = await requireDataset(datasetId);

  const [
    { rows, total, page: currentPage, pageCount, semanticError },
    products,
    anySales,
  ] = await Promise.all([
    pagedSales(dataset.id, { page, productId, from, to, search, sort, dir }),
    listProducts(dataset.id),
    hasAnySales(dataset.id),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: "Sales" }]}
          />
        }
        description="Record and review daily sales for this dataset's products."
        title="Sales"
      />
      <InlineImportCard datasetId={dataset.id} type="sales" />
      <div>
        <SalesTable
          currentDir={dir}
          currentSort={sort}
          datasetId={dataset.id}
          filters={{ productId, from, to, search, sort, dir }}
          hasAnyRecords={anySales}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/sales`}
          products={products}
          rows={rows}
          semanticError={semanticError}
          total={total}
        />
      </div>
    </div>
  );
}
