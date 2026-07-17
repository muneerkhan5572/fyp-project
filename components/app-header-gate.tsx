"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIX = /^\/dashboard\/[^/]+/;

export function AppHeaderGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (HIDDEN_PREFIX.test(pathname)) {
    return null;
  }

  return children;
}
