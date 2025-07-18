// app/api/attachments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/options"
import cloudinary from "@/lib/cloudinary"
import { prisma } from "@/server/lib/prisma"
import { ContentTypeGeneric } from "@/generated/prisma"

// ────────────────── helpers ──────────────────

// NEW ─ единая мапа MIME‑тип → Cloudinary resource_type
function mapMimeToResource(mime: string): "image" | "raw" | "video" {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("audio/")) return "video"      // Cloudinary использует video для аудио
  if (mime === "application/json") return "raw"
  throw new Error("Unsupported file type")
}

// NEW ─ схема zod для остальных (не‑файловых) полей
const metaSchema = z.object({
  objectType: z.nativeEnum(ContentTypeGeneric),
  objectId: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((n) => n === undefined || Number.isInteger(n), {
      message: "objectId must be an integer",
    }),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // ────────────────── 1. FormData ──────────────────
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) throw new Error("File not found in form‑data")

    // Собираем объект‑кандидат для zod‑валидации
    const metaCandidate = {
      objectType: formData.get("objectType"),
      objectId: formData.get("objectId") as string | undefined,
    }

    const { objectType, objectId } = metaSchema.parse(metaCandidate)

    // ────────────────── 2. Upload в Cloudinary ──────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileUri = `data:${file.type};base64,${buffer.toString("base64")}`

    const uploaded = await cloudinary.uploader.upload(fileUri, {
      resource_type: mapMimeToResource(file.type),
      folder: "uyren/UPLOAD",
    })

    // ────────────────── 3. Запись в Prisma ──────────────────
    const attachment = await prisma.attachment.create({
      data: {
        originalName: file.name,
        filename: uploaded.public_id,      // если нужна логическая разница — переименуйте
        size: uploaded.bytes,
        mimetype: file.type,
        url: uploaded.secure_url,
        path: uploaded.public_id,
        objectType,
        objectId,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 400 })
  }
}
