import KBar from "@/components/dashboard/kbar";
import AppSidebar from "@/components/dashboard/layout/app-sidebar";
import Header from "@/components/dashboard/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  CONTENT_LAYOUT_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
  type ContentLayout,
  type SidebarCollapsible,
  type SidebarVariant,
} from "@/config/preferences/layout";
import { getPreference } from "@/server/actions/preferences";
import { cookies } from "next/headers";
import { ReactNode } from "react";

export default async function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const [sidebarVariant, sidebarCollapsible, contentLayout] = await Promise.all(
    [
      getPreference<SidebarVariant>(
        "sidebar_variant",
        SIDEBAR_VARIANT_VALUES,
        "inset"
      ),
      getPreference<SidebarCollapsible>(
        "sidebar_collapsible",
        SIDEBAR_COLLAPSIBLE_VALUES,
        "icon"
      ),
      getPreference<ContentLayout>(
        "content_layout",
        CONTENT_LAYOUT_VALUES,
        "centered"
      ),
    ]
  );

  //   const layoutPreferences = {
  //     contentLayout,
  //     variant: sidebarVariant,
  //     collapsible: sidebarCollapsible,
  //   };

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} />
        <SidebarInset data-content-layout={contentLayout}>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
