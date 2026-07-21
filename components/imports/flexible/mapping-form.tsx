"use client";

import { useForm } from "@tanstack/react-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { uploadFlexibleCsv } from "@/app/actions/imports";
import { FieldMappingSelect } from "@/components/imports/flexible/field-mapping-select";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  DATE_FORMATS,
  type DateFormat,
  type FieldKey,
  type FieldMapping,
  type ImportMapping,
  importMappingSchema,
} from "@/lib/imports/flexible/mapping-schema";
import { normalizeDate } from "@/lib/imports/flexible/normalize-date";

const DATE_FORMAT_LABELS: Record<DateFormat, string> = {
  "YYYY-MM-DD": "YYYY-MM-DD (2026-07-20)",
  "MM/DD/YYYY": "MM/DD/YYYY (07/20/2026)",
  "DD/MM/YYYY": "DD/MM/YYYY (20/07/2026)",
  "DD-MM-YYYY": "DD-MM-YYYY (20-07-2026)",
  ISO_DATETIME: "ISO date-time (2026-07-20T10:00:00Z)",
};

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Name",
  sku: "SKU",
  category: "Category",
  price: "Price",
  cost: "Cost",
  stock: "Stock",
  date: "Date",
  quantity: "Quantity",
  revenue: "Revenue",
};

function sampleAt(
  mapping: FieldMapping,
  sampleRow: Record<string, string> | undefined,
): string | undefined {
  if (mapping.kind !== "column" || !sampleRow) {
    return undefined;
  }
  return sampleRow[mapping.sourceHeader];
}

function describeField(mapping: FieldMapping): string | null {
  if (mapping.kind === "column") {
    return `"${mapping.sourceHeader}"`;
  }
  if (mapping.kind === "constant") {
    return mapping.value ? `constant "${mapping.value}"` : null;
  }
  return null;
}

type SummaryLineProps = {
  fields: ImportMapping["fields"];
  deriveRevenue: boolean;
  lowConfidenceFields: FieldKey[];
};

function DetectionSummary({
  fields,
  deriveRevenue,
  lowConfidenceFields,
}: SummaryLineProps) {
  const lines: { label: string; detail: string; low: boolean }[] = [];

  for (const key of Object.keys(FIELD_LABELS) as FieldKey[]) {
    if (key === "revenue" && deriveRevenue) {
      lines.push({
        label: "Revenue",
        detail: "calculated as price × quantity",
        low: false,
      });
      continue;
    }
    const detail = describeField(fields[key]);
    if (detail) {
      lines.push({
        label: FIELD_LABELS[key],
        detail,
        low: lowConfidenceFields.includes(key),
      });
    }
  }

  const missing = lowConfidenceFields.filter(
    (key) =>
      fields[key].kind === "unmapped" && !(key === "revenue" && deriveRevenue),
  );

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-sm">
      <p className="font-medium">We matched these columns automatically:</p>
      <ul className="mt-2 flex flex-col gap-0.5 text-xs">
        {lines.map(({ label, detail, low }) => (
          <li key={label}>
            <span className="text-muted-foreground">{label}:</span> {detail}
            {low ? (
              <span className="ml-1 text-amber-600 dark:text-amber-500">
                ⚠ double-check
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {missing.length > 0 ? (
        <p className="mt-2 text-destructive text-xs">
          Couldn't confidently detect:{" "}
          {missing.map((key) => FIELD_LABELS[key]).join(", ")}. Map{" "}
          {missing.length === 1 ? "it" : "them"} below before importing.
        </p>
      ) : (
        <p className="mt-2 text-muted-foreground text-xs">
          Looks right? Import below, or adjust anything in the field list first.
        </p>
      )}
    </div>
  );
}

type MappingFormProps = {
  datasetId: string;
  file: File;
  headers: string[];
  sampleRow: Record<string, string> | undefined;
  detectedMapping: ImportMapping;
  lowConfidenceFields: FieldKey[];
  onCancel: () => void;
};

export function MappingForm({
  datasetId,
  file,
  headers,
  sampleRow,
  detectedMapping,
  lowConfidenceFields,
  onCancel,
}: MappingFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: detectedMapping,
    validators: {
      onChange: importMappingSchema,
      onSubmit: importMappingSchema,
    },
    onSubmit: ({ value }) => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("mapping", JSON.stringify(value));

      startTransition(async () => {
        const result = await uploadFlexibleCsv(datasetId, formData);
        if (result?.error) {
          toast.error(result.error);
        }
      });
    },
  });

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-sm">Review &amp; import</p>
          <p className="text-muted-foreground text-xs">{file.name}</p>
        </div>
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          Choose a different file
        </Button>
      </div>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Subscribe
          selector={(state) =>
            [state.values.fields, state.values.deriveRevenue] as const
          }
        >
          {([fields, deriveRevenue]) => (
            <DetectionSummary
              deriveRevenue={deriveRevenue}
              fields={fields}
              lowConfidenceFields={lowConfidenceFields}
            />
          )}
        </form.Subscribe>

        <div className="mt-3">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting || isPending} type="submit">
                {isSubmitting || isPending ? "Importing..." : "Import"}
              </Button>
            )}
          </form.Subscribe>
        </div>

        <details className="group mt-4">
          <summary className="cursor-pointer text-muted-foreground text-xs hover:text-foreground">
            Adjust the detected columns manually
          </summary>

          <FieldGroup className="mt-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Product
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="fields.name">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Name"
                    lowConfidence={lowConfidenceFields.includes("name")}
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Field name="fields.sku">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="SKU / product ID"
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Field name="fields.category">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Category"
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
            </div>
            <FieldDescription>
              Map a name or a SKU (or both). If SKU is left unmapped, one is
              generated from the product name — rows with the identical name
              become the same product.
            </FieldDescription>

            <p className="mt-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Pricing &amp; inventory
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="fields.price">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Unit price"
                    lowConfidence={lowConfidenceFields.includes("price")}
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Field name="fields.cost">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Cost"
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Field name="fields.stock">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Stock"
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
            </div>

            <p className="mt-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Transaction
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="fields.date">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Date"
                    lowConfidence={lowConfidenceFields.includes("date")}
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Field name="fields.quantity">
                {(field) => (
                  <FieldMappingSelect
                    field={field}
                    headers={headers}
                    label="Quantity"
                    lowConfidence={lowConfidenceFields.includes("quantity")}
                    sample={sampleAt(field.state.value, sampleRow)}
                  />
                )}
              </form.Field>
              <form.Subscribe selector={(state) => state.values.deriveRevenue}>
                {(deriveRevenue) =>
                  deriveRevenue ? (
                    <Field>
                      <FieldLabel>Revenue / total</FieldLabel>
                      <p className="text-muted-foreground text-xs">
                        Calculated as price × quantity.
                      </p>
                    </Field>
                  ) : (
                    <form.Field name="fields.revenue">
                      {(field) => (
                        <FieldMappingSelect
                          field={field}
                          headers={headers}
                          label="Revenue / total"
                          lowConfidence={lowConfidenceFields.includes(
                            "revenue",
                          )}
                          sample={sampleAt(field.state.value, sampleRow)}
                        />
                      )}
                    </form.Field>
                  )
                }
              </form.Subscribe>
            </div>

            <Field orientation="horizontal">
              <form.Field name="deriveRevenue">
                {(field) => (
                  <input
                    checked={field.state.value}
                    className="size-3.5"
                    id="deriveRevenue"
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                    type="checkbox"
                  />
                )}
              </form.Field>
              <FieldLabel className="font-normal" htmlFor="deriveRevenue">
                Calculate revenue as price × quantity instead of mapping a
                revenue column
              </FieldLabel>
            </Field>

            <form.Subscribe
              selector={(state) =>
                [state.values.fields.date, state.values.dateFormat] as const
              }
            >
              {([dateMapping, dateFormat]) => (
                <Field>
                  <FieldLabel htmlFor="dateFormat">
                    Date format
                    {lowConfidenceFields.includes("date") ? (
                      <span className="font-normal text-amber-600 dark:text-amber-500">
                        ⚠ ambiguous, please confirm
                      </span>
                    ) : null}
                  </FieldLabel>
                  <form.Field name="dateFormat">
                    {(field) => (
                      <select
                        className="h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-fit dark:bg-input/30 dark:hover:bg-input/50"
                        id="dateFormat"
                        onChange={(event) =>
                          field.handleChange(event.target.value as DateFormat)
                        }
                        value={field.state.value}
                      >
                        {DATE_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {DATE_FORMAT_LABELS[format]}
                          </option>
                        ))}
                      </select>
                    )}
                  </form.Field>
                  {dateMapping.kind === "column"
                    ? (() => {
                        const raw = sampleRow?.[dateMapping.sourceHeader];
                        if (!raw) {
                          return null;
                        }
                        const normalized = normalizeDate(raw, dateFormat);
                        return (
                          <FieldDescription>
                            {normalized
                              ? `"${raw}" reads as ${normalized}.`
                              : `"${raw}" doesn't match this format — pick a different one.`}
                          </FieldDescription>
                        );
                      })()
                    : null}
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </details>
      </form>
    </div>
  );
}
