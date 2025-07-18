import { attachmentRouter } from "./routers/attachment";
import { authRouter } from "./routers/auth";
import { postRouter } from "./routers/post";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  attachment: attachmentRouter,
  project: projectRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
