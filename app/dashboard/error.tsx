"use client";

import { useEffect } from "react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ErrorState } from "@/components/error-state";

export default function DashboardError({
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
    <>
      <DashboardTopbar />
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10">
        <ErrorState
          description="Something went wrong loading this dataset. Try again, or go back to your datasets."
          onRetry={unstable_retry}
        />
      </div>
    </>
  );
}
