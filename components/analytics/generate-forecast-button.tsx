"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { generateForecast } from "@/app/actions/forecasts";
import { Button } from "@/components/ui/button";

type GenerateForecastButtonProps = {
  datasetId: string;
  hasExistingForecast?: boolean;
};

export function GenerateForecastButton({
  datasetId,
  hasExistingForecast = false,
}: GenerateForecastButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await generateForecast(datasetId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Forecast generated.");
      router.refresh();
    });
  };

  return (
    <Button disabled={isPending} onClick={handleClick}>
      {isPending
        ? "Generating..."
        : hasExistingForecast
          ? "Refresh forecast"
          : "Generate forecast"}
    </Button>
  );
}
