// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from "@/server/api/_app";

export const trpc = createTRPCReact<AppRouter>();