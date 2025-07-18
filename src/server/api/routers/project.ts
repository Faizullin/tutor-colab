import { ContentTypeGeneric } from "@/generated/prisma";
import { documentIdValidator } from "@/lib/schema";
import { prisma } from "@/server/lib/prisma";
import z from "zod";
import { baseQueryInputSchema } from "../schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { get } from "http";
import { TRPCError } from "@trpc/server";

const queryFilterSchema = baseQueryInputSchema.shape.filter.unwrap().extend({
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for file name or original name"),
});

const queryOrderBySchema = baseQueryInputSchema.shape.orderBy.unwrap().extend({
  field: z
    .enum(["createdAt", "updatedAt", "name",])
    .default("createdAt")
    .describe("The field to order files by."),
});

const queryInputSchema = z
  .object({
    pagination: baseQueryInputSchema.shape.pagination,
    orderBy: queryOrderBySchema,
    filter: queryFilterSchema,
  })
  .optional();



const isProjectOwner = protectedProcedure.use(async ({ ctx, next, rawInput, input }) => {
  console.log("Checking project ownership with input:", rawInput, input);
  const parsedInput = rawInput as { slug: string };
  if (!parsedInput.slug) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Project slug is required for this operation.",
    });
  }

  if (!projectOwnerEmail || projectOwnerEmail !== ctx.session.user.email) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not the owner of this project.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      // You can also pass the project object down to the resolver if needed
      // project: fetchedProject,
    },
  });
});

export const projectRouter = router({
  list: publicProcedure.input(queryInputSchema).query(async ({ input }) => {
    const {
      filter = {},
      orderBy = { field: "createdAt", direction: "desc" },
      pagination = { skip: 0, take: 20 },
    } = input || {};

    const where: any = {};

    // Enhanced search functionality - search across multiple fields
    // This allows users to find files by either the system name or original filename
    if (filter.name?.trim()) {
      const searchTerm = filter.name.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [orderBy.field]: orderBy.direction },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.project.count({ where }),
    ]);

    return { items, total };
  }),

  userProjectsList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await prisma.project.findMany({
      where: { ownerId: userId },
    });
  }),

  getById: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "number") {
        throw new Error("Invalid input: expected a number");
      }
      return val;
    })
    .query(async ({ input }) => {
      return await prisma.project.findUnique({
        where: { id: input },
      });
    }),

  getUserProjectBySlug: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const foundProject = await prisma.project.findUnique({
        where: { slug: input },
      });
      if (!foundProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      if (ctx.session.user.id !== foundProject.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this project.",
        });
      }
      return foundProject;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: documentIdValidator(),
      })
    )
    .mutation(async ({ input }) => {
      const foundProject = await prisma.project.findUnique({
        where: { id: input.id },
      });
      if (!foundProject) {
        throw new Error("Project not found");
      }
      return await prisma.project.delete({
        where: { id: foundProject.id },
      });
    }),
});
