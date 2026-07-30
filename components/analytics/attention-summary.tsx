import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getStockRisk } from "@/lib/analytics/stock-risk";
import { classifyProducts } from "@/lib/analytics/velocity";
import { datasetSectionHref } from "@/lib/datasets/routes";
import type { Dataset } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export async function AttentionSummary({ dataset }: { dataset: Dataset }) {
  const [stockRisk, classified] = await Promise.all([
    getStockRisk(dataset.id),
    classifyProducts(dataset),
  ]);

  const outOfStockCount = stockRisk.filter(
    (entry) => entry.status === "out-of-stock",
  ).length;
  const atRiskCount = stockRisk.filter(
    (entry) => entry.status === "at-risk",
  ).length;
  const highDemandCount = classified.filter(
    (product) => product.classification === "high-demand",
  ).length;
  const slowMoverCount = classified.filter(
    (product) => product.classification === "slow-mover",
  ).length;

  const analyticsHref = datasetSectionHref(dataset.id, "analytics");
  const pills = [
    {
      label: "Out of stock",
      count: outOfStockCount,
      href: `${analyticsHref}#stock-risk`,
    },
    {
      label: "At risk of stocking out",
      count: atRiskCount,
      href: `${analyticsHref}#stock-risk`,
    },
    {
      label: "High demand",
      count: highDemandCount,
      href: `${analyticsHref}#high-demand`,
    },
    {
      label: "Slow movers",
      count: slowMoverCount,
      href: `${analyticsHref}#slow-mover`,
    },
  ].filter((pill) => pill.count > 0);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3">
        {pills.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing needs attention right now.
          </p>
        ) : (
          pills.map((pill) => (
            <Link
              className={cn(
                "flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm",
                pill.label === "High demand" || pill.label === "Slow movers"
                  ? "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  : "hover:bg-muted",
              )}
              href={pill.href}
              key={pill.label}
            >
              <span className="font-semibold">{pill.count}</span>
              <span className="text-muted-foreground">{pill.label}</span>
            </Link>
          ))
        )}
        <p className="w-full text-muted-foreground text-xs">
          Not affected by the date range above — see Analytics for details.
        </p>
      </CardContent>
    </Card>
  );
}
