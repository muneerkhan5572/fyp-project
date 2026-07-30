"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function HashScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const scrollToHash = () => {
      const element = document.getElementById(hash);
      if (!element) return false;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToHash()) return;

    const observer = new MutationObserver(() => {
      if (scrollToHash()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = setTimeout(() => observer.disconnect(), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}
