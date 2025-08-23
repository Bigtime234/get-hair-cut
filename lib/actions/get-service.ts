"use server"

import { db } from "@/server"
import { services } from "@/server/schema"
import { eq } from "drizzle-orm"

export const getService = async (id: string) => {
  try {
    if (!id) {
      return { error: "Service ID is required" }
    }

    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
    })

    if (!service) {
      return { error: "Service not found" }
    }

    return { success: service }
  } catch (error) {
    console.error("Get Service Error:", error)
    return { error: "Failed to fetch service. Please try again." }
  }
}

export const getServices = async () => {
  try {
    const allServices = await db.query.services.findMany({
      orderBy: (services, { desc }) => [desc(services.createdAt)],
    })

    return { success: allServices }
  } catch (error) {
    console.error("Get Services Error:", error)
    return { error: "Failed to fetch services. Please try again." }
  }
}

export const getActiveServices = async () => {
  try {
    const activeServices = await db.query.services.findMany({
      where: eq(services.isActive, true),
      orderBy: (services, { asc }) => [asc(services.name)],
    })

    return { success: activeServices }
  } catch (error) {
    console.error("Get Active Services Error:", error)
    return { error: "Failed to fetch active services. Please try again." }
  }
}