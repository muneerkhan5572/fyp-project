import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { InlineImportCard } from "@/components/imports/inline-import-card";
import { TrafficTable } from "@/components/traffic/traffic-table";
import { requireDataset } from "@/lib/datasets/dal";
import { listProductOptions } from "@/lib/products/dal";
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

  const [
    { rows, total, page: currentPage, pageCount, semanticError },
    products,
    anyTraffic,
  ] = await Promise.all([
    pagedTraffic(dataset.id, {
      page,
      productId,
      from,
      to,
      search,
      sort,
      dir,
    }),
    listProductOptions(dataset.id),
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
      <InlineImportCard datasetId={dataset.id} type="traffic" />
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
          semanticError={semanticError}
          total={total}
        />
      </div>
    </div>
  );
}
