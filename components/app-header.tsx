import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link className="font-semibold" href="/">
          Ecommerce App
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
