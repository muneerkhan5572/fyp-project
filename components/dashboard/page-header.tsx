import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-semibold text-2xl">{title}</h1>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
