"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
    <Link
      className={buttonVariants()}
      href={datasetId ? datasetSectionHref(datasetId, section) : DATASETS_HREF}
    >
      {label}
    </Link>
  );
}
