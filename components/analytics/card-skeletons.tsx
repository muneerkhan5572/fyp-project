import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function TabbedChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="mt-4 h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function ListCardSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, index) => `row-${index}`).map(
            (id) => (
              <div className="flex items-center justify-between gap-2" key={id}>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
