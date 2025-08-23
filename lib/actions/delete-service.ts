"use server"

import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { services, bookings } from "@/server/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Schema for delete action
const DeleteServiceSchema = z.object({
  id: z.string().min(1, { message: "Service ID is required" }),
})

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof DeleteServiceSchema> }) => {
  const { id } = parsedInput

  try {
    // Check if service exists
    const existingService = await db.query.services.findFirst({
      where: eq(services.id, id),
    })

    if (!existingService) {
      return { error: "Service not found" }
    }

    // Check if service has any bookings
    const serviceBookings = await db.query.bookings.findFirst({
      where: eq(bookings.serviceId, id),
    })

    if (serviceBookings) {
      return {
        error: "Cannot delete service with existing bookings. Please cancel all bookings first or set service as inactive."
      }
    }

    // Delete the service
    await db.delete(services).where(eq(services.id, id))

    revalidatePath("/dashboard/products")
    
    return { success: `Service "${existingService.name}" has been deleted successfully!` }
  } catch (error) {
    console.error("Delete Service Error:", error)
    return { error: "Failed to delete service. Please try again." }
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()
export const deleteService = actionClient
  .schema(DeleteServiceSchema)
  .action(action)