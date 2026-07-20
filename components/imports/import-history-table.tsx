import { HistoryIcon } from "lucide-react";
import Link from "next/link";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Import } from "@/lib/db/schema";

const TYPE_LABELS: Record<Import["type"], string> = {
  products: "Products",
  sales: "Sales",
  traffic: "Traffic",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ImportHistoryTableProps = {
  datasetId: string;
  imports: Import[];
};

export function ImportHistoryTable({
  datasetId,
  imports,
}: ImportHistoryTableProps) {
  if (imports.length === 0) {
    return (
      <Empty className="mt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyTitle>No imports yet</EmptyTitle>
          <EmptyDescription>
            Upload a CSV above to see its import history here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>File</TableHead>
            <TableHead className="text-right">Rows</TableHead>
            <TableHead className="text-right">Imported</TableHead>
            <TableHead className="text-right">Failed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {imports.map((row) => (
            <TableRow className="hover:bg-muted/50" key={row.id}>
              <TableCell>
                <Link
                  className="block underline-offset-2 hover:underline"
                  href={`/dashboard/${datasetId}/import/${row.id}`}
                >
                  {TYPE_LABELS[row.type]}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {row.fileName}
              </TableCell>
              <TableCell className="text-right">{row.totalRows}</TableCell>
              <TableCell className="text-right">{row.importedRows}</TableCell>
              <TableCell className="text-right">{row.failedRows}</TableCell>
              <TableCell>
                <ImportStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {dateFormatter.format(row.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
