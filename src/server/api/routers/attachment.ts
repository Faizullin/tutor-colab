import { ContentTypeGeneric } from "@/generated/prisma";
import cloudinary from "@/lib/cloudinary";
import { documentIdValidator } from "@/lib/schema";
import z from "zod";
import { baseQueryInputSchema } from "../schema";
import { adminProcedure, router } from "../trpc";

const queryFilterSchema = baseQueryInputSchema.shape.filter.unwrap().extend({
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Search term for file name or original name"),
  type: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Filter by file MIME type"),
  objectType: z.nativeEnum(ContentTypeGeneric).optional(),
  objectId: z.number().int().positive().optional(),
});

const queryOrderBySchema = baseQueryInputSchema.shape.orderBy.unwrap().extend({
  field: z
    .enum(["createdAt", "updatedAt", "size", "id"])
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

export const attachmentRouter = router({
  adminList: adminProcedure
    .input(queryInputSchema)
    .query(async ({ input, ctx }) => {
      const {
        filter = {},
        orderBy = { field: "id", direction: "desc" },
        pagination = { skip: 0, take: 20 },
      } = input || {};

      const where: any = {};

      // Enhanced search functionality - search across multiple fields
      // This allows users to find files by either the system name or original filename
      if (filter.name?.trim()) {
        const searchTerm = filter.name.trim();
        where.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { originalName: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      // Filter by MIME type (e.g., "image", "video", "pdf")
      if (filter.type?.trim())
        where.type = { contains: filter.type.trim(), mode: "insensitive" };

      // Filter by object type and ID for scoped searches
      if (filter.objectType) where.objectType = filter.objectType;
      if (filter.objectId) where.objectId = filter.objectId;

      const [items, total] = await Promise.all([
        ctx.prisma.attachment.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
        }),
        ctx.prisma.attachment.count({ where }),
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

  adminDetail: adminProcedure
    .input(documentIdValidator())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.attachment.findUnique({
        where: { id: input },
      });
    }),

  adminDelete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const foundAttachment = await ctx.prisma.attachment.findUnique({
        where: { id: input },
      });
      if (!foundAttachment) {
        throw new Error("Attachment not found");
      }

      if (foundAttachment.path) {
        try {
          await cloudinary.uploader.destroy(foundAttachment.path);
        } catch (err) {
          // Optionally log or handle Cloudinary errors, but continue with DB delete
          console.error("Cloudinary destroy error:", err);
        }
      }

      return await ctx.prisma.attachment.delete({
        where: { id: input },
      });
    }),
});
