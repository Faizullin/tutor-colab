/**
 * Root tRPC setup – with Next‑Auth protection baked in.
 *
 * 1.  `createContext()` runs for every request, attaches `session` + `prisma`.
 * 2.  `protectedProcedure` requires an authenticated user.
 *
 * Docs
 *  - tRPC v11 context:  https://trpc.io/docs/v11/context
 *  - Next‑Auth session: https://next-auth.js.org/getting-started/typescript
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { getSession } from 'next-auth/react';
import superjson from 'superjson';
import { prisma } from '../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/options';


/* -------------------------------------------------------------------------- */
/* 1. Context                                                                 */
/* -------------------------------------------------------------------------- */
export async function createContext() {
    const session = await getServerSession(authOptions);
    return { session, prisma };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

/* -------------------------------------------------------------------------- */
/* 2. initTRPC – bind Context + superjson + custom error formatter            */
/* -------------------------------------------------------------------------- */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

/* -------------------------------------------------------------------------- */
/* 3. Public vs. protected procedures                                         */
/* -------------------------------------------------------------------------- */
export const router = t.router;
export const publicProcedure = t.procedure;

/** Auth‑gate middleware */
const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: {
            //   👇 every downstream resolver now knows `ctx.session.user.id` is string
            session: ctx.session,
        },
    });
});

/** Use this for any procedure that requires a logged‑in user */
export const protectedProcedure = t.procedure.use(isAuthed);

/* Optional helpers --------------------------------------------------------- */
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
