"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function DatasetWorkspaceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      description="Something went wrong loading this page. Try again, or use the sidebar to go elsewhere."
      onRetry={unstable_retry}
    />
  );
}
