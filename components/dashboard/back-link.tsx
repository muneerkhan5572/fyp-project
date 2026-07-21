import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      href={href}
    >
      <ChevronLeftIcon />
      {label}
    </Link>
  );
}
