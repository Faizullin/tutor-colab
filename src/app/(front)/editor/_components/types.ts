import { ProjectFile } from "@/generated/prisma";
import { AppRouter } from "@/server/api/_app";
import { inferRouterOutputs } from "@trpc/server";
import { type StorageContentData } from "./service";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type ProjectRouterOutputs =
  RouterOutputs["project"]["protectedUserProjectDetailBySlug"];

export type EditProjectFile = {
  uid: string;
  // expanded: boolean;
} & (
  | {
      synced: true;
      file: ProjectFile;
    }
  | {
      synced: false;
      file: StorageContentData["project"]["files"][number];
    }
);
