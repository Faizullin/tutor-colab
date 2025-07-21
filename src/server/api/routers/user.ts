import { adminProcedure, publicProcedure, router } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { baseQueryInputSchema } from "../schema";

const queryFilterSchema = baseQueryInputSchema.shape.filter.unwrap().extend({
  username: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for user username"),
  email: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for user email"),
});

const queryOrderBySchema = baseQueryInputSchema.shape.orderBy.unwrap().extend({
  field: z
    .enum(["createdAt", "updatedAt", "id"])
    .default("createdAt")
    .describe("The field to order users by."),
});

const queryInputSchema = z
  .object({
    pagination: baseQueryInputSchema.shape.pagination,
    orderBy: queryOrderBySchema,
    filter: queryFilterSchema,
  })
  .optional();

export const userRouter = router({
  adminList: adminProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        filter = {},
        orderBy = { field: "id", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};
      if (filter.username?.trim()) {
        const searchTerm = filter.username.trim();
        where.OR = [
          { username: { contains: searchTerm, mode: "insensitive" } },
        ];
      }
      if (filter.email?.trim()) {
        const searchTerm = filter.email.trim();
        where.OR = [{ email: { contains: searchTerm, mode: "insensitive" } }];
      }

      const [items, total] = await Promise.all([
        // add prefetch owner

        ctx.prisma.userAccount.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
        }),
        ctx.prisma.userAccount.count({ where }),
      ]);

      return {
        items,
        total,
        meta: {
          take: pagination.take,
          skip: pagination.skip,
        },
      };
    }),

  /*
   * Get Public Profile
   */
  getPublicProfile: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { username } = input;

      const user = await ctx.prisma.userAccount.findUnique({
        where: { username },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        user: {
          username: user.username,
          postsCount: user._count.posts,
        },
      };
    }),
});
