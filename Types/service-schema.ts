import * as z from "zod"

// Gallery Image Schema
const GalleryImageSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  size: z.number(),
  url: z.string(),
  key: z.string().optional(),
})

// Service Schema for creating/updating services
export const ServiceSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Service name must be at least 3 characters" })
    .max(100, { message: "Service name must be less than 100 characters" }),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, { message: "Price must be a positive number" })
    .max(1000000, { message: "Price cannot exceed 1,000,000" }),
  duration: z
    .number()
    .min(15, { message: "Duration must be at least 15 minutes" })
    .max(300, { message: "Duration cannot exceed 300 minutes" }),
  category: z
    .string()
    .min(1, { message: "Please select a category" }),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  galleryUrls: z.string().optional(),
  galleryKeys: z.string().optional(),
  // Make galleryImages required with default value
  galleryImages: z.array(GalleryImageSchema),
  isActive: z.boolean(),
})

export type zServiceSchema = z.infer<typeof ServiceSchema>
export type GalleryImage = z.infer<typeof GalleryImageSchema>