"use client";

import { useState } from "react";
import { DatasetDeleteDialog } from "@/components/datasets/dataset-delete-dialog";
import { DatasetRenameDialog } from "@/components/datasets/dataset-rename-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Dataset } from "@/lib/db/schema";

export function DatasetSettingsGeneral({
  dataset,
}: {
  dataset: Pick<Dataset, "id" | "name">;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Current name: <span className="font-medium">{dataset.name}</span>
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => setRenameOpen(true)}
            size="sm"
            variant="outline"
          >
            Rename dataset
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-4 border-destructive/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this dataset and all of its products, sales,
            traffic, and import history.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => setDeleteOpen(true)}
            size="sm"
            variant="destructive"
          >
            Delete dataset
          </Button>
        </CardFooter>
      </Card>

      <DatasetRenameDialog
        dataset={dataset}
        onOpenChange={setRenameOpen}
        open={renameOpen}
      />
      <DatasetDeleteDialog
        dataset={dataset}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </>
  );
}
