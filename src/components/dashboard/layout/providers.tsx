"use client";

import NiceModal from "@/store/nice-modal-context";
import { PropsWithChildren } from "react";
import { ActiveThemeProvider } from "../common/active-theme";

export default function Providers({
  activeThemeValue,
  children,
}: PropsWithChildren<{
  activeThemeValue: string;
}>) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <NiceModal.Provider>{children}</NiceModal.Provider>
      </ActiveThemeProvider>
    </>
  );
}
