"use server"

import { ServiceGallerySchema } from "@/Types/service-gallery"
import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { services } from "@/server/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof ServiceGallerySchema> }) => {
  const {
    serviceId,
    imageUrl,
    imageKey,
    galleryImages,
    galleryUrls,
    galleryKeys
  } = parsedInput

  try {
    // Check if service exists
    const existingService = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })

    if (!existingService) {
      return { error: "Service not found" }
    }

    // Process gallery data
    let finalGalleryUrls: string | null = null
    let finalGalleryKeys: string | null = null

    // Process galleryImages array to URLs for database storage
    if (galleryImages && galleryImages.length > 0) {
      const urls = galleryImages.map(img => img.url).filter(Boolean)
      finalGalleryUrls = urls.length > 0 ? JSON.stringify(urls) : null
      
      // Also extract keys from images if they exist
      const imageKeys = galleryImages.map(img => img.key).filter(Boolean)
      if (imageKeys.length > 0) {
        // Combine image keys with gallery tags
        const allKeys = [...new Set([...galleryKeys, ...imageKeys])]
        finalGalleryKeys = allKeys.length > 0 ? JSON.stringify(allKeys) : null
      } else {
        finalGalleryKeys = galleryKeys.length > 0 ? JSON.stringify(galleryKeys) : null
      }
    } else {
      // No images uploaded, just use the gallery keys (tags)
      finalGalleryUrls = galleryUrls || null
      finalGalleryKeys = galleryKeys.length > 0 ? JSON.stringify(galleryKeys) : null
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Only update imageUrl and imageKey if they're provided
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null
    }
    if (imageKey !== undefined) {
      updateData.imageKey = imageKey || null
    }

    // Always update gallery data
    updateData.galleryUrls = finalGalleryUrls
    updateData.galleryKeys = finalGalleryKeys

    // Update service gallery
    await db.update(services)
      .set(updateData)
      .where(eq(services.id, serviceId))

    // Revalidate multiple paths to ensure UI updates
    revalidatePath("/dashboard/services")
    revalidatePath("/dashboard")
    revalidatePath(`/service/${serviceId}`) // In case you have individual service pages

    const galleryCount = galleryImages?.length || 0
    const message = galleryCount > 0 
      ? `Gallery for "${existingService.name}" updated with ${galleryCount} image${galleryCount > 1 ? 's' : ''}!`
      : `Gallery settings for "${existingService.name}" have been updated!`

    return { success: message }

  } catch (error) {
    console.error("Update Service Gallery Error:", error)
    
    // More detailed error handling
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return { error: "Failed to update service gallery. Please check your connection and try again." }
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()

export const updateServiceGallery = actionClient
  .schema(ServiceGallerySchema)
  .action(action)