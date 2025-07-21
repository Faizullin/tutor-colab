import { UserRole } from "@/generated/prisma";
import { documentIdValidator } from "@/lib/schema";
import z from "zod";
import { baseQueryInputSchema } from "../schema";
import { adminProcedure, protectedProcedure, router } from "../trpc";

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
    .enum(["createdAt", "updatedAt", "name"])
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

const documentSlugValidator = (zod = z) => {
  return zod
    .string()
    .min(1)
    .max(255)
    .refine((val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "Document slug must be a valid slug format",
    });
};

export const projectRouter = router({
  adminList: adminProcedure
    .input(queryInputSchema)
    .query(async ({ ctx, input }) => {
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
        where.OR = [{ name: { contains: searchTerm, mode: "insensitive" } }];
      }

      const [items, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          orderBy: { [orderBy.field]: orderBy.direction },
          skip: pagination.skip,
          take: pagination.take,
        }),
        ctx.prisma.project.count({ where }),
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

  adminCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        slug: documentSlugValidator(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, slug } = input;
      const existingProject = await ctx.prisma.project.findUnique({
        where: { slug },
      });
      if (existingProject) {
        throw new Error("Project with this slug already exists");
      }
      return await ctx.prisma.project.create({
        data: {
          name,
          slug,
          ownerId: ctx.session!.user.id,
        },
      });
    }),

  adminDetail: adminProcedure
    .input(documentIdValidator())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.project.findUnique({
        where: { id: input },
      });
    }),

  adminDelete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const foundAttachment = await ctx.prisma.project.findUnique({
        where: { id: input },
      });
      if (!foundAttachment) {
        throw new Error("Attachment not found");
      }

      return await ctx.prisma.project.delete({
        where: { id: input },
      });
    }),

  protectedUserProjectList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id;
    return await ctx.prisma.project.findMany({
      where: { ownerId: userId },
    });
  }),

  protectedUserProjectDetailBySlug: protectedProcedure
    .input(documentSlugValidator())
    .query(async ({ input, ctx }) => {
      const projectObj = await ctx.prisma.project.findUnique({
        where: { slug: input },
        include: {
          files: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
            },
          },
        },
      });
      if (!projectObj) {
        throw new Error("Project not found");
      }
      const isAdmin = ctx.session!.user.role === UserRole.admin;
      if (projectObj.id === ctx.session!.user.id && !isAdmin) {
        throw new Error("You are not authorized to access this project");
      }
      return projectObj;
    }),

  protectedUserProjectFileList: protectedProcedure
    .input(documentIdValidator())
    .query(async ({ input, ctx }) => {
      const userId = ctx.session!.user.id;
      const project = await ctx.prisma.project.findUnique({
        where: { id: input },
      });

      if (!project) {
        throw new Error("Project not found or you do not have access");
      }

      if (project.ownerId !== userId) {
        throw new Error("You do not have permission to access this project");
      }

      return await ctx.prisma.projectFile.findMany({
        where: { projectId: project.id },
      });
    }),

  protectedSaveProjectFileContent: protectedProcedure
    .input(
      z.object({
        id: documentIdValidator(),
        content: z.string().optional(),
        name: z.string().min(1).max(255).optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectFile = await ctx.prisma.projectFile.findUnique({
        where: { id: input.id },
      });
      if (!projectFile) {
        throw new Error("Project file not found");
      }
      const parentProject = await ctx.prisma.project.findUnique({
        where: { id: projectFile.projectId },
      });
      if (!parentProject) {
        throw new Error("Parent project not found");
      }
      if (parentProject.ownerId !== ctx.session!.user.id) {
        throw new Error("You do not have permission to edit this project file");
      }
      const data = {...input}
      return await ctx.prisma.projectFile.update({
        where: { id: projectFile.id },
        data,
      });
    }),

  protectedAddProjectFile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        language: z.string().optional(),
        projectId: documentIdValidator(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectObj = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
      });
      if (!projectObj) {
        throw new Error("Project not found");
      }
      if (projectObj.ownerId !== ctx.session!.user.id) {
        throw new Error(
          "You do not have permission to add files to this project"
        );
      }
      const newFile = await ctx.prisma.projectFile.create({
        data: {
          name: input.name,
          language: input.language,
          projectId: projectObj.id,
          path: "",
        },
      });
      const newPath = `Path:${projectObj.slug}/${newFile.id}`;
      return await ctx.prisma.projectFile.update({
        where: { id: newFile.id },
        data: { path: newPath },
      });
    }),

  protectedDeleteProjectFile: protectedProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const projectFile = await ctx.prisma.projectFile.findUnique({
        where: { id: input },
      });
      if (!projectFile) {
        throw new Error("Project file not found");
      }
      const parentProject = await ctx.prisma.project.findUnique({
        where: { id: projectFile.projectId },
      });
      if (!parentProject) {
        throw new Error("Parent project not found");
      }
      if (parentProject.ownerId !== ctx.session!.user.id) {
        throw new Error(
          "You do not have permission to delete this project file"
        );
      }
      return await ctx.prisma.projectFile.delete({
        where: { id: projectFile.id },
      });
    }),

  protectedDeleteProject: protectedProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      if (project.ownerId !== ctx.session!.user.id) {
        throw new Error("You do not have permission to delete this project");
      }
      return await ctx.prisma.project.delete({
        where: { id: project.id },
      });
    }),
});
