"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getReviewSentimentProgress } from "@/app/actions/reviews";

const POLL_INTERVAL_MS = 2000;
const MAX_STALLED_POLLS = 5;

type ReviewSentimentProgressProps = {
  datasetId: string;
  initialTotal: number;
  initialDone: number;
};

export function ReviewSentimentProgress({
  datasetId,
  initialTotal,
  initialDone,
}: ReviewSentimentProgressProps) {
  const router = useRouter();
  const [{ total, done }, setCounts] = useState({
    total: initialTotal,
    done: initialDone,
  });
  const lastDone = useRef(initialDone);
  const stalledPolls = useRef(0);

  useEffect(() => {
    if (initialTotal === 0 || initialDone >= initialTotal) {
      return;
    }

    const interval = setInterval(async () => {
      const result = await getReviewSentimentProgress(datasetId);
      if ("error" in result) {
        return;
      }

      if (result.done <= lastDone.current) {
        stalledPolls.current += 1;
      } else {
        stalledPolls.current = 0;
      }
      lastDone.current = result.done;

      setCounts(result);

      if (result.done >= result.total) {
        clearInterval(interval);
        router.refresh();
      } else if (stalledPolls.current >= MAX_STALLED_POLLS) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [datasetId, initialDone, initialTotal, router]);

  if (total === 0 || done >= total) {
    return null;
  }

  const percent = Math.round((done / total) * 100);

  return (
    <div className="mb-6 rounded-md border p-3 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>
          Analyzing sentiment: {done} / {total} reviews
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
