"use server"

import { db } from "@/server"
import { workingHours, blockedTimes, bookings } from "@/server/schema"
import { eq, and, gte, lte } from "drizzle-orm"

export type TimeSlot = {
  time: string
  available: boolean
  reason?: string
}

export async function getAvailableSlots(
  date: Date,
  serviceDuration: number
): Promise<{ success: TimeSlot[] } | { error: string }> {
  try {
    const selectedDate = new Date(date)
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as 
      'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

    // Get working hours for the selected day
    const workingHour = await db.query.workingHours.findFirst({
      where: and(
        eq(workingHours.dayOfWeek, dayName),
        eq(workingHours.isAvailable, true)
      ),
    })

    if (!workingHour) {
      return { success: [] } // No working hours for this day
    }

    // Check if the entire day is blocked
    const allDayBlock = await db.query.blockedTimes.findFirst({
      where: and(
        eq(blockedTimes.date, selectedDate),
        eq(blockedTimes.isAllDay, true)
      ),
    })

    if (allDayBlock) {
      return { success: [] } // Entire day is blocked
    }

    // Get all blocked time periods for this date
    const blockedPeriods = await db.query.blockedTimes.findMany({
      where: and(
        eq(blockedTimes.date, selectedDate),
        eq(blockedTimes.isAllDay, false)
      ),
    })

    // Get all existing bookings for this date
    const existingBookings = await db.query.bookings.findMany({
      where: and(
        gte(bookings.appointmentDate, new Date(selectedDate.setHours(0, 0, 0, 0))),
        lte(bookings.appointmentDate, new Date(selectedDate.setHours(23, 59, 59, 999)))
      ),
    })

    // Generate time slots
    const timeSlots: TimeSlot[] = []
    const startTime = parseTime(workingHour.startTime)
    const endTime = parseTime(workingHour.endTime)
    
    // Create 30-minute intervals
    const slotInterval = 30 // minutes
    let currentTime = startTime

    while (currentTime < endTime) {
      const timeString = formatTime(currentTime)
      const slotEndTime = currentTime + serviceDuration
      
      // Check if slot extends beyond working hours
      if (slotEndTime > endTime) {
        break
      }

      // Check if slot conflicts with blocked times
      const isBlocked = blockedPeriods.some(blocked => {
        if (!blocked.startTime || !blocked.endTime) return false
        const blockedStart = parseTime(blocked.startTime)
        const blockedEnd = parseTime(blocked.endTime)
        
        // Check for overlap
        return (currentTime < blockedEnd && slotEndTime > blockedStart)
      })

      // Check if slot conflicts with existing bookings
      const isBooked = existingBookings.some(booking => {
        const bookingStart = parseTime(booking.startTime)
        const bookingEnd = parseTime(booking.endTime)
        
        // Check for overlap
        return (currentTime < bookingEnd && slotEndTime > bookingStart)
      })

      // Don't allow booking in the past
      const now = new Date()
      const slotDateTime = new Date(selectedDate)
      slotDateTime.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0)
      const isPast = slotDateTime <= now

      let available = true
      let reason: string | undefined

      if (isPast) {
        available = false
        reason = "Past time"
      } else if (isBlocked) {
        available = false
        reason = "Blocked"
      } else if (isBooked) {
        available = false
        reason = "Booked"
      }

      timeSlots.push({
        time: timeString,
        available,
        reason,
      })

      currentTime += slotInterval
    }

    return { success: timeSlots }
  } catch (error) {
    console.error("Error getting available slots:", error)
    return { error: "Failed to get available time slots" }
  }
}

// Helper function to parse time string (HH:MM) to minutes since midnight
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to format minutes since midnight to time string (HH:MM)
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Helper function to get day of week from date
export async function getDayOfWeek(date: Date): Promise<string> {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}