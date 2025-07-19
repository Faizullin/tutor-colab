"use client";

import { TRPCReactProvider } from "@/server/provider";
import NiceModal from "@/store/nice-modal-context";
import useAuthStore from "@/store/userAuthStore";
import { SessionProvider, useSession } from "next-auth/react";
import { PropsWithChildren, useEffect } from "react";

export default function Providers({
  children,
}: PropsWithChildren) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <UserProvider>
          <NiceModal.Provider>{children}</NiceModal.Provider>
        </UserProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}

const UserProvider = ({
  children,
}: PropsWithChildren) => {
  const { data: session } = useSession();
  const { setUser } = useAuthStore();
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as any);
    }
  }, [session, setUser]);
  return <>{children}</>;
};