"use client";

import { ChevronsUpDownIcon, LayoutGridIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { Dataset } from "@/lib/db/schema";

type DatasetSwitcherProps = {
  datasets: Dataset[];
  currentDatasetId: string;
};

export function DatasetSwitcher({
  datasets,
  currentDatasetId,
}: DatasetSwitcherProps) {
  const router = useRouter();
  const current = datasets.find((dataset) => dataset.id === currentDatasetId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button className="justify-between gap-2" variant="outline" />}
      >
        <span className="max-w-40 truncate">
          {current?.name ?? "Select dataset"}
        </span>
        <ChevronsUpDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Datasets</DropdownMenuLabel>
          {datasets.map((dataset) => (
            <DropdownMenuItem
              data-active={dataset.id === currentDatasetId}
              key={dataset.id}
              onClick={() => router.push(`/dashboard/${dataset.id}`)}
            >
              <span className="truncate">{dataset.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard?all=1")}>
          <LayoutGridIcon />
          Manage datasets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
