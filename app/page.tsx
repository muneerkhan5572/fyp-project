import { BarChart3Icon, TrendingUpIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";

const FEATURES = [
  {
    icon: UploadIcon,
    title: "Bring your own data",
    description:
      "Import products, sales, and traffic from CSV, or enter records by hand — with row-by-row validation and idempotent re-uploads.",
  },
  {
    icon: BarChart3Icon,
    title: "See the trends",
    description:
      "Revenue, units, top sellers, and category breakdowns on a live dashboard, filterable by date range across every dataset you track.",
  },
  {
    icon: TrendingUpIcon,
    title: "Know what's moving",
    description:
      "Automatic slow-mover and high-demand classification based on sales velocity, with thresholds you control per dataset.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
          Understand your sales, product by product.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Upload your store's sales and traffic data, or enter it by hand, and
          get dashboards, trends, and demand classification without touching a
          spreadsheet formula.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            className={buttonVariants({ size: "lg" })}
            href={user ? "/dashboard" : "/signup"}
          >
            {user ? "Go to your datasets" : "Get started"}
          </Link>
          {user ? null : (
            <Link
              className={buttonVariants({ size: "lg", variant: "outline" })}
              href="/login"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="size-5 text-muted-foreground" />
              <CardTitle className="mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
