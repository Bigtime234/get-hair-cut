"use server"

import { RatingSchema } from "@/Types/rating-schema"
import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from "@/server"
import { ratings, bookings, services } from "@/server/schema"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const action = async ({ parsedInput }: { parsedInput: z.infer<typeof RatingSchema> }) => {
  const { bookingId, customerId, stars } = parsedInput

  try {
    // Check if booking exists and is completed
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        service: true,
      },
    })

    if (!booking) {
      return { error: "Booking not found" }
    }

    if (booking.status !== 'completed') {
      return { error: "You can only rate completed bookings" }
    }

    if (booking.customerId !== customerId) {
      return { error: "You can only rate your own bookings" }
    }

    // Check if rating already exists
    const existingRating = await db.query.ratings.findFirst({
      where: eq(ratings.bookingId, bookingId),
    })

    if (existingRating) {
      // Update existing rating
      await db.update(ratings)
        .set({
          stars,
        })
        .where(eq(ratings.bookingId, bookingId))
    } else {
      // Create new rating
      await db.insert(ratings).values({
        bookingId,
        customerId,
        stars,
      })
    }

    // Update service rating statistics
    await updateServiceRatingStats(booking.serviceId)

    revalidatePath("/dashboard/bookings")
    revalidatePath("/dashboard/services")
    
    return { success: "Rating has been submitted successfully!" }
  } catch (error) {
    console.error("Create Rating Error:", error)
    return { error: "Failed to submit rating. Please try again." }
  }
}

// Helper function to update service rating statistics
async function updateServiceRatingStats(serviceId: string) {
  try {
    // Get all ratings for this service through bookings
    const serviceRatings = await db.query.ratings.findMany({
      with: {
        booking: {
          with: {
            service: true,
          },
        },
      },
    })

    // Filter ratings for this specific service
    const relevantRatings = serviceRatings.filter(
      (rating) => rating.booking && rating.booking.serviceId === serviceId
    )

    const totalRatings = relevantRatings.length
   
    if (totalRatings === 0) {
      await db.update(services)
        .set({
          totalRatings: 0,
          averageRating: '0.00',
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        })
        .where(eq(services.id, serviceId))
      return
    }

    // Calculate statistics
    const starCounts = {
      5: relevantRatings.filter(r => r.stars === 5).length,
      4: relevantRatings.filter(r => r.stars === 4).length,
      3: relevantRatings.filter(r => r.stars === 3).length,
      2: relevantRatings.filter(r => r.stars === 2).length,
      1: relevantRatings.filter(r => r.stars === 1).length,
    }

    const totalStars = relevantRatings.reduce((sum, rating) => sum + rating.stars, 0)
    const averageRating = (totalStars / totalRatings).toFixed(2)

    // Update service statistics
    await db.update(services)
      .set({
        totalRatings,
        averageRating,
        fiveStars: starCounts[5],
        fourStars: starCounts[4],
        threeStars: starCounts[3],
        twoStars: starCounts[2],
        oneStar: starCounts[1],
      })
      .where(eq(services.id, serviceId))
  } catch (error) {
    console.error("Update Service Rating Stats Error:", error)
  }
}

// Create the safe action client and export the action
const actionClient = createSafeActionClient()
export const createRating = actionClient
  .schema(RatingSchema)
  .action(action)