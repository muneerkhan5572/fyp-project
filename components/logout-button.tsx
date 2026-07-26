"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
      variant="outline"
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
