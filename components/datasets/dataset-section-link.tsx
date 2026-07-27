"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/dashboard/back-button";
import { DATASETS_HREF, datasetSectionHref } from "@/lib/datasets/routes";

type DatasetSectionLinkProps = {
  section: string;
  label: string;
};

export function DatasetSectionLink({
  section,
  label,
}: DatasetSectionLinkProps) {
  const pathname = usePathname();
  const datasetId = pathname.split("/")[2];

  return (
    <BackButton
      href={datasetId ? datasetSectionHref(datasetId, section) : DATASETS_HREF}
      label={label}
    />
  );
}
