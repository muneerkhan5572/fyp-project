import { Badge } from "@/components/ui/badge";
import type { Import } from "@/lib/db/schema";

const LABELS: Record<Import["status"], string> = {
  completed: "Completed",
  completed_with_errors: "Completed with errors",
  failed: "Failed",
};

const VARIANTS: Record<
  Import["status"],
  "default" | "outline" | "destructive"
> = {
  completed: "default",
  completed_with_errors: "outline",
  failed: "destructive",
};

export function ImportStatusBadge({ status }: { status: Import["status"] }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
