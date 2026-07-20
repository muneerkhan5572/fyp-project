"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function RootError({
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
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <ErrorState onRetry={unstable_retry} />
    </div>
  );
}
