import { redirect } from "next/navigation";
import { datasetHref } from "@/lib/datasets/routes";

export default async function DatasetRootPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  redirect(datasetHref(datasetId));
}
