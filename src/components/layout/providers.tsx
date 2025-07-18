"use client";

import { TRPCReactProvider } from "@/server/provider";
import NiceModal from "@/store/nice-modal-context";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";
import { ActiveThemeProvider } from "../dashboard/common/active-theme";

export default function Providers({
  children,
  activeThemeValue,
}: PropsWithChildren<{
  activeThemeValue: string;
}>) {
  return (
    <SessionProvider>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <TRPCReactProvider>
          <NiceModal.Provider>{children}</NiceModal.Provider>
        </TRPCReactProvider>
      </ActiveThemeProvider>
    </SessionProvider>
  );
}
