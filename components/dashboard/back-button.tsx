import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  label: string;
  variant?: "default" | "ghost" | "outline";
  className?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function BackButton({
  label,
  href,
  onClick,
  variant = "default",
  className,
}: BackButtonProps) {
  if (href) {
    return (
      <Link className={cn(buttonVariants({ variant }), className)} href={href}>
        <ArrowLeftIcon />
        {label}
      </Link>
    );
  }

  return (
    <Button className={className} onClick={onClick} variant={variant}>
      <ArrowLeftIcon />
      {label}
    </Button>
  );
}
