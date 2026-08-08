"use client";

import { ChevronDownIcon, DatabaseIcon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DATASETS_HREF, datasetHref } from "@/lib/datasets/routes";
import type { Dataset } from "@/lib/db/schema";

type DatasetSwitcherProps = {
  datasets: Dataset[];
  currentDatasetId: string;
};

export function DatasetSwitcher({
  datasets,
  currentDatasetId,
}: DatasetSwitcherProps) {
  const current = datasets.find((dataset) => dataset.id === currentDatasetId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="h-auto w-full justify-between gap-2.5 rounded-lg px-3 py-2.5"
            variant="outline"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <DatabaseIcon className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="max-w-36 truncate font-medium text-sm">
              {current?.name ?? "Select dataset"}
            </span>
            <span className="text-muted-foreground text-xs">Dataset</span>
          </span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm">Datasets</DropdownMenuLabel>
          {datasets.map((dataset) => (
            <DropdownMenuItem
              className="min-h-9 gap-2.5 px-2.5 py-2 text-sm"
              data-active={dataset.id === currentDatasetId}
              key={dataset.id}
              render={<Link href={datasetHref(dataset.id)} />}
            >
              <span className="truncate">{dataset.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-9 gap-2.5 px-2.5 py-2 text-sm"
          render={<Link href={DATASETS_HREF} />}
        >
          <LayoutGridIcon className="size-4" />
          Manage datasets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
