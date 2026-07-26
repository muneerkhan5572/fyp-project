import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const SECTIONS = [
  { key: "sales-traffic", headingWidth: "w-40", cards: ["chart-1", "chart-2"] },
  {
    key: "product-performance",
    headingWidth: "w-52",
    cards: ["chart-3", "chart-4", "chart-5"],
  },
  {
    key: "inventory-risk",
    headingWidth: "w-36",
    cards: ["chart-6", "chart-7", "chart-8"],
  },
];

export default function DatasetAnalyticsLoading() {
  return (
    <div>
      <PageHeaderSkeleton
        actionsWidth="w-32"
        descriptionWidth="w-64"
        titleWidth="w-28"
      />

      {SECTIONS.map((section, index) => (
        <div className={index === 0 ? "mt-6" : "mt-8"} key={section.key}>
          <Skeleton className={`h-7 ${section.headingWidth}`} />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {section.cards.map((id) => (
              <Skeleton className="h-72 w-full" key={id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
