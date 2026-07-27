import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { TrafficTable } from "@/components/traffic/traffic-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProducts } from "@/lib/products/dal";
import { hasAnyTraffic, pagedTraffic } from "@/lib/traffic/dal";
import { trafficListParamsSchema } from "@/lib/validations/traffic";

type TrafficPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrafficPage({
  params,
  searchParams,
}: TrafficPageProps) {
  const { datasetId } = await params;
  const { page, productId, from, to, search, sort, dir } =
    trafficListParamsSchema.parse(await searchParams);
  const dataset = await requireDataset(datasetId);

  const [{ rows, total, page: currentPage, pageCount }, products, anyTraffic] =
    await Promise.all([
      pagedTraffic(dataset.id, {
        page,
        productId,
        from,
        to,
        search,
        sort,
        dir,
      }),
      listProducts(dataset.id),
      hasAnyTraffic(dataset.id),
    ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: "Traffic" }]}
          />
        }
        description="Record and review daily page views for this dataset's products."
        title="Traffic"
      />
      <div className="mt-6">
        <TrafficTable
          currentDir={dir}
          currentSort={sort}
          datasetId={dataset.id}
          filters={{ productId, from, to, search, sort, dir }}
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
