"use server"

import { BookingSchema } from "@/Types/booking-schema"
import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { bookings, services } from "@/server/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof BookingSchema> }) => {
  const {
    id,
    customerId,
    serviceId,
    appointmentDate,
    startTime,
    endTime,
    status,
    totalPrice,
    notes,
    cancelReason
  } = parsedInput

  try {
    // Check if service exists and is active
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })

    if (!service) {
      return { error: "Service not found" }
    }

    if (!service.isActive) {
      return { error: "This service is currently not available for booking" }
    }

    // Convert date to timestamp for database storage
    const appointmentDateTime = new Date(appointmentDate)

    if (id) {
      // Update existing booking
      const existingBooking = await db.query.bookings.findFirst({
        where: eq(bookings.id, id),
      })

      if (!existingBooking) {
        return { error: "Booking not found" }
      }

      await db.update(bookings)
        .set({
          serviceId,
          appointmentDate: appointmentDateTime,
          startTime,
          endTime,
          status,
          totalPrice: totalPrice.toString(),
          notes,
          cancelReason,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, id))

      revalidatePath("/dashboard/bookings")
      return { success: "Booking has been updated successfully!" }
    } else {
      // Check for conflicting bookings
      const conflictingBooking = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.appointmentDate, appointmentDateTime),
          eq(bookings.startTime, startTime),
          eq(bookings.status, 'confirmed')
        ),
      })

      if (conflictingBooking) {
        return { error: "This time slot is already booked. Please choose a different time." }
      }

      // Create new booking
      await db.insert(bookings).values({
        customerId,
        serviceId,
        appointmentDate: appointmentDateTime,
        startTime,
        endTime,
        status: status || 'pending',
        totalPrice: totalPrice.toString(),
        notes,
      })

      revalidatePath("/dashboard/products")
      return { success: "Booking has been created successfully!" }
    }
  } catch (error) {
    console.error("Create/Update Booking Error:", error)
    return { error: `Failed to ${id ? "update" : "create"} booking. Please try again.` }
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()
export const createBooking = actionClient
  .schema(BookingSchema)
  .action(action)