import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-80" titleWidth="w-24" />
      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-2 h-4 w-56" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-7 w-36" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-7 w-32" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
            <Skeleton className="mt-4 h-7 w-36" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
