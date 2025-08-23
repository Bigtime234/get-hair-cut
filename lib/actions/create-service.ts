"use server"

import { ServiceSchema } from "@/Types/service-schema"
import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { services } from "@/server/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof ServiceSchema> }) => {
  const {
    id,
    name,
    description,
    price,
    duration,
    category,
    imageUrl,
    imageKey,
    galleryUrls,
    galleryKeys,
    galleryImages,
    isActive
  } = parsedInput

  try {
    // Convert galleryImages array to strings for database storage
    const galleryUrlsString = galleryImages?.map(img => img.url).join(',') || galleryUrls || ''
    const galleryKeysString = galleryImages?.map(img => img.key).filter(Boolean).join(',') || galleryKeys || ''

    if (id) {
      // Update existing service
      const existingService = await db.query.services.findFirst({
        where: eq(services.id, id),
      })

      if (!existingService) {
        return { error: "Service not found" }
      }

      await db.update(services)
        .set({
          name,
          description,
          price: price.toString(),
          duration,
          category,
          imageUrl,
          imageKey,
          galleryUrls: galleryUrlsString,
          galleryKeys: galleryKeysString,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(services.id, id))

      revalidatePath("/dashboard/products")
      return { success: `Service "${name}" has been updated successfully!` }
    } else {
      // Create new service
      await db.insert(services).values({
        name,
        description,
        price: price.toString(),
        duration,
        category,
        imageUrl,
        imageKey,
        galleryUrls: galleryUrlsString,
        galleryKeys: galleryKeysString,
        isActive,
      })

      revalidatePath("/dashboard/products")
      return { success: `Service "${name}" has been created successfully!` }
    }
  } catch (error) {
    console.error("Create/Update Service Error:", error)
    return { error: `Failed to ${id ? "update" : "create"} service. Please try again.` }
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()
export const createService = actionClient
  .schema(ServiceSchema)
  .action(action)