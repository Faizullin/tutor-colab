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

import { UserRole } from '@/generated/prisma';
import { authOptions } from '@/lib/options';
import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';
import superjson from 'superjson';
import { prisma } from '../lib/prisma';


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
        ctx,
    });
});

/** Use this for any procedure that requires a logged‑in user */
export const protectedProcedure = t.procedure.use(isAuthed);

const hasRole = (role: UserRole) => {
    return t.middleware(async ({ ctx, next }) => {
        const user = ctx.session!.user;
        if (user.role !== role) {
            throw new TRPCError({ code: 'FORBIDDEN', message: `You must be a ${role} to perform this action.` });
        }
        return next({
            ctx: {
                session: ctx.session,
            },
        });
    });
}

// Use this for any procedure that requires a logged-in user with a specific role
export const adminProcedure = protectedProcedure.use(hasRole(UserRole.admin));