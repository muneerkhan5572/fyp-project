"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDatasetThresholds } from "@/app/actions/datasets";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { Dataset } from "@/lib/db/schema";
import { updateDatasetThresholdsClientSchema } from "@/lib/validations/datasets";

type DatasetThresholdsFormProps = {
  dataset: Pick<
    Dataset,
    | "id"
    | "slowVelocityThreshold"
    | "highVelocityThreshold"
    | "velocityWindowDays"
  >;
};

export function DatasetThresholdsForm({ dataset }: DatasetThresholdsFormProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      slowVelocityThreshold: dataset.slowVelocityThreshold,
      highVelocityThreshold: dataset.highVelocityThreshold,
      velocityWindowDays: String(dataset.velocityWindowDays),
    },
    validators: {
      onChange: updateDatasetThresholdsClientSchema,
      onSubmit: updateDatasetThresholdsClientSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateDatasetThresholds({
        id: dataset.id,
        ...value,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const fieldErrors = result?.fieldErrors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors).flat()[0];
        if (firstError) {
          toast.error(firstError);
        }
        return;
      }
      toast.success(result?.success ?? "Saved.");
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <p className="text-muted-foreground text-sm">
        A product is <span className="font-medium">high demand</span> when it
        sells at or above the high-demand threshold, and a{" "}
        <span className="font-medium">slow mover</span> when it sells below the
        slow-mover threshold — both measured in average units sold per day over
        the trailing window, ending on this dataset's most recent sale. Anything
        in between is normal, and products with no sales at all show as no data.
      </p>
      <FieldGroup className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="slowVelocityThreshold">
          {(field) => (
            <TextField
              field={field}
              inputMode="decimal"
              label="Slow-mover threshold (units/day)"
              min={0}
              step="0.01"
              type="number"
            />
          )}
        </form.Field>
        <form.Field name="highVelocityThreshold">
          {(field) => (
            <TextField
              field={field}
              inputMode="decimal"
              label="High-demand threshold (units/day)"
              min={0}
              step="0.01"
              type="number"
            />
          )}
        </form.Field>
        <form.Field name="velocityWindowDays">
          {(field) => (
            <TextField
              field={field}
              inputMode="numeric"
              label="Window (days)"
              min={7}
              step="1"
              type="number"
            />
          )}
        </form.Field>
      </FieldGroup>
      <div className="mt-4">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save thresholds"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
