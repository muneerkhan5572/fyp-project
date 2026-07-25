"use client";

import {
  BarChart3Icon,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavCounts = {
  products: number;
  sales: number;
  traffic: number;
};

const NAV_GROUPS = [
  {
    label: "Insights",
    items: [
      { href: "", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/import", label: "Import", icon: UploadIcon },
      {
        href: "/products",
        label: "Products",
        icon: PackageIcon,
        count: "products",
      },
      { href: "/sales", label: "Sales", icon: ReceiptIcon, count: "sales" },
      {
        href: "/traffic",
        label: "Traffic",
        icon: TrendingUpIcon,
        count: "traffic",
      },
    ],
  },
  {
    label: "Manage",
    items: [{ href: "/settings", label: "Settings", icon: SettingsIcon }],
  },
] as const;

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

export function DatasetNav({
  datasetId,
  counts,
}: {
  datasetId: string;
  counts: NavCounts;
}) {
  const pathname = usePathname();
  const base = `/dashboard/${datasetId}`;

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const href = `${base}${item.href}`;
                const isActive =
                  item.href === ""
                    ? pathname === base
                    : pathname.startsWith(href);
                const count =
                  "count" in item
                    ? counts[item.count as keyof NavCounts]
                    : null;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {count ? (
                      <SidebarMenuBadge>
                        {compactNumber.format(count)}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
