import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";

type DashboardTopbarProps = {
  leading?: ReactNode;
};

export function DashboardTopbar({ leading }: DashboardTopbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      {leading}
      <Link
        className="flex items-center gap-2 font-semibold text-base"
        href="/"
      >
        <Logo className="size-5 text-primary" />
        EPDP
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <LogoutButton />
      </div>
    </div>
  );
}
