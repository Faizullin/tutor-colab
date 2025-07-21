import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CONTENT_LAYOUT_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
  type ContentLayout,
  type SidebarCollapsible,
  type SidebarVariant,
} from "@/config/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/server/actions/preferences";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
import { LayoutControls } from "./_components/sidebar/layout-controls";
import { SearchDialog } from "./_components/sidebar/search-dialog";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import { PreferencesStoreProvider } from "@/store/preferences/provider";
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  ThemeMode,
  ThemePreset,
} from "@/config/preferences/theme";
import { Breadcrumbs } from "./_components/common/breadcrumbs";

const LayoutRender = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
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

  const layoutPreferences = {
    contentLayout,
    variant: sidebarVariant,
    collapsible: sidebarCollapsible,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} />
      <SidebarInset
        data-content-layout={contentLayout}
        className={cn(
          "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
          // Adds right margin for inset sidebar in centered layout up to 113rem.
          // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
          "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto"
        )}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <SearchDialog />
              <LayoutControls {...layoutPreferences} />
              <ThemeSwitcher />
              {/* <AccountSwitcher users={users} /> */}
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeMode = await getPreference<ThemeMode>(
    "theme_mode",
    THEME_MODE_VALUES,
    "light"
  );
  const themePreset = await getPreference<ThemePreset>(
    "theme_preset",
    THEME_PRESET_VALUES,
    "default"
  );
  return (
    <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
      <LayoutRender>{children}</LayoutRender>
    </PreferencesStoreProvider>
  );
}
