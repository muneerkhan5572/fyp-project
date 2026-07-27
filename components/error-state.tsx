"use client";

import { AlertTriangleIcon } from "lucide-react";
import { BackButton } from "@/components/dashboard/back-button";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
  backHref?: string;
  backLabel?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Try again, or go back if the problem persists.",
  onRetry,
  backHref,
  backLabel = "Back",
}: ErrorStateProps) {
  return (
    <Empty className="mt-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry}>Try again</Button>
        {backHref ? (
          <BackButton href={backHref} label={backLabel} variant="outline" />
        ) : null}
      </EmptyContent>
    </Empty>
  );
}
