"use client";

import { TRPCReactProvider } from "@/server/provider";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";


export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        {children}
      </TRPCReactProvider>
    </SessionProvider>
  );
}
