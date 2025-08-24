// NEW FILE: lib/actions/get-service-with-relations.ts
// CREATE THIS FILE: lib/actions/get-service-with-relations.ts
// Enhanced service querying with all relations (like your product variant example)

"use server"

import { db } from "@/server"
import { services } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getServicesWithRelations() {
  try {
    const servicesData = await db.query.services.findMany({
      with: {
        bookings: {
          with: {
            customer: true,
            rating: true,
          },
        },
      },
      orderBy: (services, { desc }) => [desc(services.createdAt)],
    })

    return { success: servicesData }
  } catch (error) {
    console.error("Error fetching services with relations:", error)
    return { error: "Failed to fetch services" }
  }
}

export async function getServiceWithBookings(serviceId: string) {
  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
      with: {
        bookings: {
          with: {
            customer: true,
            rating: true,
          },
          orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
        },
      },
    })

    if (!service) {
      return { error: "Service not found" }
    }

    return { success: service }
  } catch (error) {
    console.error("Error fetching service with bookings:", error)
    return { error: "Failed to fetch service details" }
  }
}

export async function getActiveServices() {
  try {
    const activeServices = await db.query.services.findMany({
      where: eq(services.isActive, true),
      with: {
        bookings: {
          with: {
            customer: true,
            rating: true,
          },
        },
      },
      orderBy: (services, { asc }) => [services.name],
    })

    return { success: activeServices }
  } catch (error) {
    console.error("Error fetching active services:", error)
    return { error: "Failed to fetch active services" }
  }
}

export async function getServicesByCategory(category: string) {
  try {
    const categoryServices = await db.query.services.findMany({
      where: eq(services.category, category),
      with: {
        bookings: {
          with: {
            customer: true,
            rating: true,
          },
        },
      },
      orderBy: (services, { desc }) => [desc(services.averageRating)],
    })

    return { success: categoryServices }
  } catch (error) {
    console.error("Error fetching services by category:", error)
    return { error: "Failed to fetch services by category" }
  }
}