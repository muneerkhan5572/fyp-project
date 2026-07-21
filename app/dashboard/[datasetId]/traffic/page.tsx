import { BackLink } from "@/components/dashboard/back-link";
import { TrafficTable } from "@/components/traffic/traffic-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProducts } from "@/lib/products/dal";
import { hasAnyTraffic, pagedTraffic } from "@/lib/traffic/dal";

type TrafficPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<{
    page?: string;
    productId?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function TrafficPage({
  params,
  searchParams,
}: TrafficPageProps) {
  const { datasetId } = await params;
  const { page, productId, from, to } = await searchParams;
  const dataset = await requireDataset(datasetId);

  const [{ rows, total, page: currentPage, pageCount }, products, anyTraffic] =
    await Promise.all([
      pagedTraffic(dataset.id, {
        page: page ? Number(page) : undefined,
        productId,
        from,
        to,
      }),
      listProducts(dataset.id),
      hasAnyTraffic(dataset.id),
    ]);

  return (
    <div>
      <BackLink href={`/dashboard/${dataset.id}`} label="Overview" />
      <div className="mt-2">
        <h1 className="font-semibold text-2xl">Traffic</h1>
        <p className="text-muted-foreground text-sm">
          Record and review daily page views for this dataset's products.
        </p>
      </div>
      <div className="mt-6">
        <TrafficTable
          datasetId={dataset.id}
          filters={{ productId, from, to }}
          hasAnyRecords={anyTraffic}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/traffic`}
          products={products}
          rows={rows}
          total={total}
        />
      </div>
    </div>
  );
}
