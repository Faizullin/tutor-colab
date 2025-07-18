"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "@/store/userAuthStore";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { UserAvatarProfile } from "../common/user-avatart-profile";

export function UserNav() {
  const { user } = useAuthStore();
  const userInfo = useMemo(() => {
    return {
      imageUrl: user?.profileUrl || "",
      fullName: user?.username,
      emailAddresses: user?.email ? [{ emailAddress: user.email }] : [],
    };
  }, [user]);
  const router = useRouter();
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {userInfo && <UserAvatarProfile user={userInfo} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="end"
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">
                {userInfo?.fullName}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {userInfo?.emailAddresses[0].emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                useAuthStore.getState().logout();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
