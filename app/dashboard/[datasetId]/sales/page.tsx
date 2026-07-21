import { BackLink } from "@/components/dashboard/back-link";
import { SalesTable } from "@/components/sales/sales-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProducts } from "@/lib/products/dal";
import { hasAnySales, pagedSales } from "@/lib/sales/dal";

type SalesPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<{
    page?: string;
    productId?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function SalesPage({
  params,
  searchParams,
}: SalesPageProps) {
  const { datasetId } = await params;
  const { page, productId, from, to } = await searchParams;
  const dataset = await requireDataset(datasetId);

  const [{ rows, total, page: currentPage, pageCount }, products, anySales] =
    await Promise.all([
      pagedSales(dataset.id, {
        page: page ? Number(page) : undefined,
        productId,
        from,
        to,
      }),
      listProducts(dataset.id),
      hasAnySales(dataset.id),
    ]);

  return (
    <div>
      <BackLink href={`/dashboard/${dataset.id}`} label="Overview" />
      <div className="mt-2">
        <h1 className="font-semibold text-2xl">Sales</h1>
        <p className="text-muted-foreground text-sm">
          Record and review daily sales for this dataset's products.
        </p>
      </div>
      <div className="mt-6">
        <SalesTable
          datasetId={dataset.id}
          filters={{ productId, from, to }}
          hasAnyRecords={anySales}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/sales`}
          products={products}
          rows={rows}
          total={total}
        />
      </div>
    </div>
  );
}
