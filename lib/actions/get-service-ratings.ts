"use server"
import { db } from "@/server"
import { ratings, services, bookings } from "@/server/schema"
import { eq, desc } from "drizzle-orm"

export async function getServiceRatings(serviceId: string) {
  try {
    // Get service details first
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })
    
    if (!service) {
      return { error: "Service not found" }
    }

    // Get all ratings for bookings of this service
    const serviceRatings = await db.query.ratings.findMany({
      with: {
        booking: {
          with: {
            service: true,
          },
        },
        customer: true,
      },
      where: (ratings, { exists, and }) =>
        exists(
          db.select()
            .from(bookings) // Fixed: Use imported bookings table
            .where(
              and(
                eq(bookings.id, ratings.bookingId),
                eq(bookings.serviceId, serviceId)
              )
            )
        ),
      orderBy: [desc(ratings.createdAt)],
    })

    // Calculate rating statistics
    const stats = {
      averageRating: service.averageRating ? parseFloat(service.averageRating.toString()) : 0,
      totalRatings: service.totalRatings || 0,
      fiveStars: service.fiveStars || 0,
      fourStars: service.fourStars || 0,
      threeStars: service.threeStars || 0,
      twoStars: service.twoStars || 0,
      oneStar: service.oneStar || 0,
    }

    return {
      success: {
        ratings: serviceRatings,
        stats,
      },
    }
  } catch (error) {
    console.error("Error fetching service ratings:", error)
    return { error: "Failed to fetch service ratings" }
  }
}

export async function getServiceRatingStats(serviceId: string) {
  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })
    
    if (!service) {
      return { error: "Service not found" }
    }

    const stats = {
      averageRating: service.averageRating ? parseFloat(service.averageRating.toString()) : 0,
      totalRatings: service.totalRatings || 0,
      fiveStars: service.fiveStars || 0,
      fourStars: service.fourStars || 0,
      threeStars: service.threeStars || 0,
      twoStars: service.twoStars || 0,
      oneStar: service.oneStar || 0,
    }

    return { success: stats }
  } catch (error) {
    console.error("Error fetching rating stats:", error)
    return { error: "Failed to fetch rating statistics" }
  }
}

export async function getAllServicesWithRatings() {
  try {
    const servicesWithRatings = await db.query.services.findMany({
      orderBy: [desc(services.averageRating)],
    })

    const formattedServices = servicesWithRatings.map(service => ({
      ...service,
      averageRating: service.averageRating ? parseFloat(service.averageRating.toString()) : 0,
      price: service.price ? parseFloat(service.price.toString()) : 0,
    }))

    return { success: formattedServices }
  } catch (error) {
    console.error("Error fetching services with ratings:", error)
    return { error: "Failed to fetch services with ratings" }
  }
}

// Helper function to calculate review average - Made async for "use server" compliance
export async function getServiceRatingAverage(ratings: number[]): Promise<number> {
  if (ratings.length === 0) return 0
 
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}