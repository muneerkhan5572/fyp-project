import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";

export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link className="font-semibold" href="/">
          Ecommerce App
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href="/dashboard"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href="/login"
              >
                Login
              </Link>
              <Link className={buttonVariants({ size: "sm" })} href="/signup">
                Sign up
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
