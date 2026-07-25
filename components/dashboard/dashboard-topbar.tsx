import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";

type DashboardTopbarProps = {
  leading?: ReactNode;
  title?: string;
};

export function DashboardTopbar({ leading, title }: DashboardTopbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      {leading}
      {title ? (
        <span className="truncate font-medium text-sm">{title}</span>
      ) : (
        <Link className="font-semibold text-sm" href="/">
          Sales Analytics
        </Link>
      )}
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <LogoutButton />
      </div>
    </div>
  );
}
