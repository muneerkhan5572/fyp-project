"use client";

import {
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  TrendingUpIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/sales", label: "Sales", icon: ReceiptIcon },
  { href: "/traffic", label: "Traffic", icon: TrendingUpIcon },
  { href: "/import", label: "Import", icon: UploadIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function DatasetNav({ datasetId }: { datasetId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${datasetId}`;

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => {
        const href = `${base}${item.href}`;
        const isActive =
          item.href === "" ? pathname === base : pathname.startsWith(href);

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              isActive={isActive}
              render={<Link href={href} />}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
