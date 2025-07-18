import { NavItem } from "@/types/layout";
import { LayersIcon, LayoutDashboardIcon } from "lucide-react";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: LayoutDashboardIcon,
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Level",
    url: "/dashboard/level",
    icon: LayersIcon,
    shortcut: ["l", "l"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#", // Placeholder as there is no direct link for the parent
    // icon: "billing",
    isActive: true,

    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        // icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  // {
  //     title: 'Kanban',
  //     url: '/dashboard/kanban',
  //     icon: 'kanban',
  //     shortcut: ['k', 'k'],
  //     isActive: false,
  //     items: [] // No child items
  // }
];
