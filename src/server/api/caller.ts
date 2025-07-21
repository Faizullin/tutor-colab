import { appRouter } from "./_app";
import { createCallerFactoryFn, createContext } from "./trpc";

export const createCaller = createCallerFactoryFn(appRouter);

export const trpcCaller = createCaller(createContext);
