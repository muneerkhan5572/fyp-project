import { ChevronDownIcon } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_GROUP_SKELETONS = [
  { label: "Data", itemIds: ["item-1", "item-2", "item-3", "item-4"] },
  { label: "Insights", itemIds: ["item-1", "item-2"] },
  { label: "Manage", itemIds: ["item-1"] },
];

export function DatasetSidebarSkeleton() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUP_SKELETONS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.itemIds.map((id) => (
                  <SidebarMenuItem key={id}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Skeleton className="size-4 shrink-0" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </>
  );
}
