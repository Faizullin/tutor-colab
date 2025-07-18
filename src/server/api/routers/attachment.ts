import { ContentTypeGeneric } from "@/generated/prisma";
import z from "zod";
import { publicProcedure, router } from "../trpc";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/server/lib/prisma";
import { documentIdValidator } from "@/lib/schema";

const queryFilterSchema = z.object({
    filter: z
        .object({
            name: z.string().min(1).max(255).optional().describe("Search term for file name or original name"),
            type: z.string().min(1).max(100).optional().describe("Filter by file MIME type"),
            objectType: z.nativeEnum(ContentTypeGeneric).optional(),
            objectId: z.number().int().positive().optional(),
        })
        .optional(),
    orderBy: z
        .object({
            field: z.enum(["createdAt", "updatedAt", "name", "originalName", "size", "type"]).default("createdAt"),
            direction: z.enum(["asc", "desc"]).default("desc"),
        })
        .optional(),
    pagination: z
        .object({
            skip: z.number().int().min(0).default(0),
            take: z.number().int().min(1).max(1000).default(20),
        })
        .optional(),
});

export const attachmentRouter = router({
    list: publicProcedure.input(queryFilterSchema).query(async ({ input }) => {
        const {
            filter = {},
            orderBy = { field: "createdAt", direction: "desc" },
            pagination = { skip: 0, take: 20 },
        } = input;

        const where: any = {};

        // Enhanced search functionality - search across multiple fields
        // This allows users to find files by either the system name or original filename
        if (filter.name?.trim()) {
            const searchTerm = filter.name.trim();
            where.OR = [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { originalName: { contains: searchTerm, mode: "insensitive" } }
            ];
        }

        // Filter by MIME type (e.g., "image", "video", "pdf")
        if (filter.type?.trim())
            where.type = { contains: filter.type.trim(), mode: "insensitive" };

        // Filter by object type and ID for scoped searches
        if (filter.objectType) where.objectType = filter.objectType;
        if (filter.objectId) where.objectId = filter.objectId;

        const [items, total] = await Promise.all([
            prisma.attachment.findMany({
                where,
                orderBy: { [orderBy.field]: orderBy.direction },
                skip: pagination.skip,
                take: pagination.take,
            }),
            prisma.attachment.count({ where }),
        ]);

        return { items, total };
    }),

    getById: publicProcedure
        .input((val: unknown) => {
            if (typeof val !== "number") {
                throw new Error("Invalid input: expected a number");
            }
            return val;
        })
        .query(async ({ input }) => {
            return await prisma.attachment.findUnique({
                where: { id: input },
            });
        }),
    delete: publicProcedure
        .input(
            z.object({
                id: documentIdValidator(),
            })
        )
        .mutation(async ({ input }) => {
            const foundAttachment = await prisma.attachment.findUnique({
                where: { id: input.id },
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

            return await prisma.attachment.delete({
                where: { id: input.id },
            });
        }),
});