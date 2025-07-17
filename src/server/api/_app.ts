import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { postsRouter } from "./routers/post";
import { router } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    posts: postsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;