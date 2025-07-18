// src/server/schemas/base.ts
import { z } from "zod";

// --- Pagination Schema ---
export const paginationSchema = z
  .object({
    skip: z.number().int().min(0).default(0),
    take: z.number().int().min(1).max(1000).default(20),
  })
  .optional()
  .describe("Pagination parameters: skip and take.");

// --- Sorting Schema ---
// Define a type for common sortable fields if you have them, otherwise, this can be dynamic later.
// For now, let's keep it generic, as the specific fields will vary per entity.
export const baseOrderBySchema = z
  .object({
    field: z.string().min(1).describe("The field to order by."), // This will be refined in extended schemas
    direction: z.enum(["asc", "desc"]).default("desc"),
  })
  .optional()
  .describe("Sorting parameters: field and direction.");

// --- Base Filter Schema ---
// This is a placeholder; specific filter fields will be added in extended schemas.
export const baseFilterSchema = z
  .object({}) // An empty object initially, to be extended
  .optional()
  .describe("Base filter parameters.");

// --- Base Query Input Schema (combining pagination, sorting, and base filter) ---
export const baseQueryInputSchema = z.object({
  pagination: paginationSchema,
  orderBy: baseOrderBySchema,
  filter: baseFilterSchema,
});

export type BaseQueryInput = z.infer<typeof baseQueryInputSchema>;
