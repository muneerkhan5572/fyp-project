import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import Link from "next/link";
import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DatasetSetupState, SetupStep } from "@/lib/analytics/setup-state";
import { datasetSectionHref } from "@/lib/datasets/routes";
import { cn } from "@/lib/utils";

type SetupChecklistProps = {
  datasetId: string;
  state: DatasetSetupState;
};

type ChecklistItem = {
  step: SetupStep;
  title: string;
  description: string;
  done: boolean;
  optional?: boolean;
  action?: { label: string; href: string };
};

const NEXT_STEP_HINT: Record<Exclude<SetupStep, "complete">, string> = {
  products: "Add products so sales can be linked to them.",
  sales: "Record sales — every KPI and chart is derived from them.",
  traffic: "Add traffic to see page views alongside sales.",
  forecast: "Generate a forecast to unlock stock risk and demand predictions.",
};

function buildItems(
  datasetId: string,
  state: DatasetSetupState,
): ChecklistItem[] {
  return [
    {
      step: "products",
      title:
        state.productCount > 0
          ? `${state.productCount} product${state.productCount === 1 ? "" : "s"}`
          : "Add products",
      description: "Your catalog. Sales and traffic attach to these by SKU.",
      done: state.productCount > 0,
      action: {
        label: state.productCount > 0 ? "View" : "Add products",
        href: datasetSectionHref(datasetId, "products"),
      },
    },
    {
      step: "sales",
      title:
        state.salesCount > 0
          ? `${state.salesCount} sales record${state.salesCount === 1 ? "" : "s"}`
          : "Record sales",
      description:
        "Every KPI, chart, and classification is derived from these.",
      done: state.salesCount > 0,
      action: {
        label: state.salesCount > 0 ? "View" : "Record sales",
        href: datasetSectionHref(datasetId, "sales"),
      },
    },
    {
      step: "traffic",
      title:
        state.trafficCount > 0
          ? `${state.trafficCount} traffic record${state.trafficCount === 1 ? "" : "s"}`
          : "Add traffic",
      description:
        "Daily page views. Adds a views trend — nothing depends on it.",
      done: state.trafficCount > 0,
      optional: true,
      action: {
        label: state.trafficCount > 0 ? "View" : "Add traffic",
        href: datasetSectionHref(datasetId, "traffic"),
      },
    },
    {
      step: "forecast",
      title: state.hasForecast ? "Forecast generated" : "Generate a forecast",
      description:
        "Unlocks stock risk and forecast-based demand classification.",
      done: state.hasForecast,
    },
  ];
}

export function SetupChecklist({ datasetId, state }: SetupChecklistProps) {
  if (state.isComplete) {
    return null;
  }

  const items = buildItems(datasetId, state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get this dataset ready</CardTitle>
        <CardDescription>
          {NEXT_STEP_HINT[state.nextStep as Exclude<SetupStep, "complete">]}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {items.map((item) => {
          const isNext = item.step === state.nextStep;

          return (
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-md px-2 py-2",
                isNext && "bg-muted",
              )}
              key={item.step}
            >
              {item.done ? (
                <CheckCircle2Icon className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <CircleIcon className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-sm">
                  {item.title}
                  {item.optional ? (
                    <span className="text-muted-foreground text-xs">
                      Optional
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.step === "forecast" ? (
                  state.salesCount > 0 ? (
                    <GenerateForecastButton
                      datasetId={datasetId}
                      hasExistingForecast={state.hasForecast}
                    />
                  ) : null
                ) : item.action ? (
                  <Link
                    className={buttonVariants({
                      variant: isNext ? "default" : "outline",
                    })}
                    href={item.action.href}
                  >
                    {item.action.label}
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
