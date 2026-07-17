"use client";

import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DatasetDeleteDialog } from "@/components/datasets/dataset-delete-dialog";
import { DatasetRenameDialog } from "@/components/datasets/dataset-rename-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dataset } from "@/lib/db/schema";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>
            <Link className="hover:underline" href={`/dashboard/${dataset.id}`}>
              {dataset.name}
            </Link>
          </CardTitle>
          <CardDescription>
            Updated {new Date(dataset.updatedAt).toLocaleDateString()}
          </CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon-sm" variant="ghost" />}
              >
                <MoreVerticalIcon />
                <span className="sr-only">Dataset actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  variant="destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
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
