import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DATASETS_HREF, datasetHref } from "@/lib/datasets/routes";

export type Crumb = {
  label: string;
  href?: string;
};

type DatasetBreadcrumbsProps = {
  datasetId: string;
  datasetName: string;
  trail?: Crumb[];
};

export function DatasetBreadcrumbs({
  datasetId,
  datasetName,
  trail = [],
}: DatasetBreadcrumbsProps) {
  const crumbs: Crumb[] = [
    { label: "Datasets", href: DATASETS_HREF },
    {
      label: datasetName,
      href: trail.length > 0 ? datasetHref(datasetId) : undefined,
    },
    ...trail,
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.label}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-60 truncate">
                  {crumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
