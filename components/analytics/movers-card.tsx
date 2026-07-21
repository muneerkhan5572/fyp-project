import Link from "next/link";
import { ClassificationBadge } from "@/components/analytics/classification-badge";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classifyProducts } from "@/lib/analytics/velocity";
import type { Dataset } from "@/lib/db/schema";

const TITLES = {
  "slow-mover": "Slow movers",
  "high-demand": "High demand",
} as const;

type MoversKind = keyof typeof TITLES;

export async function MoversCard({
  dataset,
  kind,
}: {
  dataset: Dataset;
  kind: MoversKind;
}) {
  const classified = await classifyProducts(dataset);
  const matches = classified
    .filter((product) => product.classification === kind)
    .sort((a, b) =>
      kind === "high-demand"
        ? b.velocity - a.velocity
        : a.velocity - b.velocity,
    )
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{TITLES[kind]}</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <NoDataMessage
            message={`No ${TITLES[kind].toLowerCase()} right now.`}
          />
        ) : (
          <ul className="space-y-2">
            {matches.map((product) => (
              <li
                className="flex items-center justify-between gap-2 text-sm"
                key={product.productId}
              >
                <Link
                  className="truncate underline-offset-2 hover:underline"
                  href={`/dashboard/${dataset.id}/products/${product.productId}`}
                >
                  {product.name}
                </Link>
                <span className="shrink-0 text-muted-foreground text-xs">
                  {product.velocity.toFixed(2)} units/day
                  {product.velocitySource === "forecast" ? " (predicted)" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function ClassificationLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
      <ClassificationBadge classification="high-demand" />
      <ClassificationBadge classification="normal" />
      <ClassificationBadge classification="slow-mover" />
      <ClassificationBadge classification="no-data" />
    </div>
  );
}
