import * as z from "zod"

// Gallery Image Schema
export const GalleryImageSchema = z.object({
  name: z.string(),
  size: z.number(),
  url: z.string(),
  key: z.string().optional(),
})

// Service Gallery Schema for managing service images
export const ServiceGallerySchema = z.object({
  serviceId: z.string().min(1, { message: "Service ID is required" }),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  galleryImages: z.array(GalleryImageSchema).default([]),
  galleryUrls: z.string().optional(),
  galleryKeys: z.array(z.string()).default([]),
})

export type zServiceGallerySchema = z.infer<typeof ServiceGallerySchema>