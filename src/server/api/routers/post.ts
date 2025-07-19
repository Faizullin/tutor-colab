import { documentIdValidator } from "@/lib/schema";
import { adminProcedure, publicProcedure, router } from "@/server/api/trpc";
import { z } from "zod";
import { baseQueryInputSchema } from "../schema";



const queryFilterSchema = baseQueryInputSchema.shape.filter.unwrap().extend({
  title: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for post title"),
});

const queryOrderBySchema = baseQueryInputSchema.shape.orderBy.unwrap().extend({
  field: z
    .enum(["createdAt", "updatedAt", "id"])
    .default("createdAt")
    .describe("The field to order posts by."),
});

const queryInputSchema = z
  .object({
    pagination: baseQueryInputSchema.shape.pagination,
    orderBy: queryOrderBySchema,
    filter: queryFilterSchema,
  })
  .optional();

const createPostInputSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().optional(),
});

export const postRouter = router({
  publicList: publicProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        filter = {},
        orderBy = { field: "id", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};
      if (filter.title?.trim()) {
        const searchTerm = filter.title.trim();
        where.OR = [
          { title: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.prisma.post.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
        }),
        ctx.prisma.post.count({ where }),
      ]);

      return {
        items,
        total,
        meta: {
          take: pagination.take,
          skip: pagination.skip,
        }
      };
    }),

  publicGetById: publicProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  adminList: adminProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        filter = {},
        orderBy = { field: "id", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};
      if (filter.title?.trim()) {
        const searchTerm = filter.title.trim();
        where.OR = [
          { title: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        // add prefetch owner

        ctx.prisma.post.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.post.count({ where }),
      ]);

      return {
        items,
        total,
        meta: {
          take: pagination.take,
          skip: pagination.skip,
        }
      };
    }),

  adminDetail: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  adminCreate: adminProcedure
    .input(createPostInputSchema)
    .mutation(async ({ ctx, input }) => {
      return {
        post: await ctx.prisma.post.create({
          data: {
            ownerId: ctx.session!.user.id,
            title: input.title,
            content: input.content || "",
          },
        }),
      };
    }),

  adminUpdate: adminProcedure
    .input(createPostInputSchema.extend({
      id: documentIdValidator(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        post: await ctx.prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            content: input.content || "",
          },
        }),
      };
    }),

  adminDelete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.post.delete({
        where: { id: input },
      });
    }),
});

