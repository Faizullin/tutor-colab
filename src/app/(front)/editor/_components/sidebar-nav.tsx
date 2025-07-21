import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilesIcon, SettingsIcon } from "lucide-react";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
}

export default function SidebarNav({
  activeTab,
  onTabChange,
}: SidebarNavProps) {
  const sidebarIcons = [
    {
      id: "files",
      icon: <FilesIcon className="w-5 h-5" />,
      tooltip: "Explorer",
    },
    // { id: "search", icon: <Search className="w-5 h-5" />, tooltip: "Search" },
    // { id: "git", icon: <GitBranchIcon className="w-5 h-5" />, tooltip: "Source Control" },
    // { id: "debug", icon: <BugIcon className="w-5 h-5" />, tooltip: "Run and Debug" },
    // { id: "settings", icon: <Settings className="w-5 h-5" />, tooltip: "Settings" },
  ];

  return (
    <div className="h-full bg-[#1e1e1e] w-12 flex flex-col items-center justify-between py-2 border-r border-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <TooltipProvider delayDuration={300}>
          {sidebarIcons.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-sm ${
                    activeTab === item.id
                      ? "bg-[#252525] text-emerald-400 border-l-2 border-emerald-600"
                      : "text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors"
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#252525] text-white border-gray-800"
              >
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-sm text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors mt-auto"
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-[#252525] text-white border-gray-800"
          >
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
