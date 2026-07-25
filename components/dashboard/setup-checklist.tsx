import { ArrowRightIcon, CheckCircle2Icon, CircleIcon } from "lucide-react";
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
  secondaryAction?: { label: string; href: string };
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
  const importHref = datasetSectionHref(datasetId, "import");

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
      secondaryAction:
        state.productCount > 0
          ? undefined
          : { label: "Import CSV", href: importHref },
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
      secondaryAction:
        state.salesCount > 0
          ? undefined
          : { label: "Import CSV", href: importHref },
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
                {item.secondaryAction ? (
                  <Link
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    href={item.secondaryAction.href}
                  >
                    {item.secondaryAction.label}
                  </Link>
                ) : null}
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
                      size: "sm",
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

export function SetupNextStepStrip({ datasetId, state }: SetupChecklistProps) {
  if (state.isComplete || state.nextStep === "products") {
    return null;
  }

  const hint = NEXT_STEP_HINT[state.nextStep as Exclude<SetupStep, "complete">];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2">
      <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">Next: </span>
        <span className="text-muted-foreground">{hint}</span>
      </p>
      {state.nextStep === "forecast" ? (
        <GenerateForecastButton
          datasetId={datasetId}
          hasExistingForecast={state.hasForecast}
        />
      ) : (
        <Link
          className={buttonVariants({ size: "sm" })}
          href={datasetSectionHref(datasetId, state.nextStep)}
        >
          Go to {state.nextStep}
        </Link>
      )}
    </div>
  );
}
