import { ChevronsUpDownIcon } from "lucide-react";
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
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <Skeleton className="h-4 w-24" />
          <ChevronsUpDownIcon className="text-muted-foreground" />
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
