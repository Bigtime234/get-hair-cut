"use server"

import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { bookings, ratings } from "@/server/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Schema for delete booking action
const DeleteBookingSchema = z.object({
  id: z.string().min(1, { message: "Booking ID is required" }),
})

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof DeleteBookingSchema> }) => {
  const { id } = parsedInput
  
  try {
    // Check if booking exists
    const existingBooking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        service: true,
        customer: true,
      },
    })

    if (!existingBooking) {
      return { error: "Booking not found" }
    }

    // Check if booking can be deleted (only pending/cancelled bookings)
    if (existingBooking.status === 'completed') {
      return {
        error: "Cannot delete completed bookings. This booking has already been finished."
      }
    }

    // Delete any associated ratings first
    await db.delete(ratings).where(eq(ratings.bookingId, id))
    
    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, id))
    
    revalidatePath("/dashboard/products")
    
    return {
      success: `Booking for ${existingBooking.customer.name} on ${existingBooking.appointmentDate.toDateString()} has been deleted successfully!`
    }
  } catch (error) {
    console.error("Delete Booking Error:", error)
    return { error: "Failed to delete booking. Please try again." }
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()
export const deleteBooking = actionClient
  .schema(DeleteBookingSchema)
  .action(action)