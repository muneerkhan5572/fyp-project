import { FileWarningIcon } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { DatasetSectionLink } from "@/components/datasets/dataset-section-link";
import { ImportHistoryTable } from "@/components/imports/import-history-table";
import { ImportReport } from "@/components/imports/import-report";
import { ImportWizard } from "@/components/imports/import-wizard";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { requireDataset } from "@/lib/datasets/dal";
import { datasetHref } from "@/lib/datasets/routes";
import { getImport, pagedImports } from "@/lib/imports/dal";
import { importsListParamsSchema } from "@/lib/validations/imports";

type DatasetImportPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const REPORT_STAT_IDS = ["stat-1", "stat-2", "stat-3"];
const REPORT_ROW_IDS = ["row-1", "row-2", "row-3", "row-4"];

function ImportReportSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-56" titleWidth="w-40" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {REPORT_STAT_IDS.map((id) => (
          <Skeleton className="h-16 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {REPORT_ROW_IDS.map((id) => (
          <Skeleton className="h-9 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-36" />
      </div>
    </div>
  );
}

async function ImportReportSection({
  datasetId,
  datasetName,
  importId,
}: {
  datasetId: string;
  datasetName: string;
  importId: string;
}) {
  const importRow = await getImport(datasetId, importId);

  if (!importRow) {
    return (
      <Empty className="mt-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarningIcon />
          </EmptyMedia>
          <EmptyTitle>Import not found</EmptyTitle>
          <EmptyDescription>
            This import doesn't exist or you don't have access to it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <DatasetSectionLink label="Back to import" section="import" />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={datasetId}
            datasetName={datasetName}
            trail={[
              { label: "Import", href: datasetHref(datasetId) },
              { label: importRow.fileName },
            ]}
          />
        }
        description="Details for this CSV import."
        title="Import report"
      />
      <div>
        <ImportReport datasetId={datasetId} importRow={importRow} />
      </div>
    </div>
  );
}

export default async function DatasetImportPage({
  params,
  searchParams,
}: DatasetImportPageProps) {
  const { datasetId } = await params;
  const { page, search, type, status, importId } =
    importsListParamsSchema.parse(await searchParams);
  const dataset = await requireDataset(datasetId);

  if (importId) {
    return (
      <Suspense fallback={<ImportReportSkeleton />}>
        <ImportReportSection
          datasetId={dataset.id}
          datasetName={dataset.name}
          importId={importId}
        />
      </Suspense>
    );
  }

  const [setupState, { rows, total, page: currentPage, pageCount }] =
    await Promise.all([
      getDatasetSetupState(dataset.id),
      pagedImports(dataset.id, { page, search, type, status }),
    ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
          />
        }
        description="Import data and review upload history."
        title={dataset.name}
      />
      <SetupChecklist datasetId={dataset.id} state={setupState} />

      <div className="mt-6">
        <ImportWizard datasetId={dataset.id} />
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-lg">Import history</h2>
        <ImportHistoryTable
          datasetId={dataset.id}
          filters={{ search, type, status }}
          imports={rows}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/import`}
          total={total}
        />
      </div>
    </div>
  );
}
