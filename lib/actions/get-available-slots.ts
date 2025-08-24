// NEW FILE: lib/actions/get-available-slots.ts
// CREATE THIS FILE: lib/actions/get-available-slots.ts
// Real-time availability checking for LiveBookingWidget

"use server"

import { db } from "@/server"
import { workingHours, blockedTimes, bookings } from "@/server/schema"
import { and, eq, gte, lte, between } from "drizzle-orm"

type GetAvailableSlotsParams = {
  serviceId: string
  date: Date
  duration: number
}

type TimeSlot = {
  time: string
  available: boolean
  reason?: string
}

function generateTimeSlots(startTime: string, endTime: string, interval: number = 30): string[] {
  const slots: string[] = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    currentMinute += interval
    if (currentMinute >= 60) {
      currentHour += 1
      currentMinute = 0
    }
  }
  
  return slots
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.split(':').map(Number)
  const totalMinutes = hour * 60 + minute + minutes
  const newHour = Math.floor(totalMinutes / 60)
  const newMinute = totalMinutes % 60
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
}

function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  return time >= startTime && time < endTime
}

export async function getAvailableSlots({ serviceId, date, duration }: GetAvailableSlotsParams) {
  try {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as 
      'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

    // Get working hours for the day
    const workingHour = await db.query.workingHours.findFirst({
      where: and(
        eq(workingHours.dayOfWeek, dayOfWeek),
        eq(workingHours.isAvailable, true)
      ),
    })

    if (!workingHour) {
      return { success: [] }
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(workingHour.startTime, workingHour.endTime, 30)
    
    // Get blocked times for the date
    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    const blockedTimesForDate = await db.query.blockedTimes.findMany({
      where: and(
        gte(blockedTimes.date, dateStart),
        lte(blockedTimes.date, dateEnd)
      ),
    })

    // Get existing bookings for the date
    const existingBookings = await db.query.bookings.findMany({
      where: and(
        gte(bookings.appointmentDate, dateStart),
        lte(bookings.appointmentDate, dateEnd),
        // Only consider confirmed bookings, not cancelled ones
        eq(bookings.status, 'confirmed')
      ),
      with: {
        service: true,
      },
    })

    // Check availability for each slot
    const availableSlots: TimeSlot[] = allSlots.map((time) => {
      const slot: TimeSlot = {
        time,
        available: true,
      }

      // Check if time is in the past (for today's date)
      const now = new Date()
      const slotDateTime = new Date(date)
      const [hour, minute] = time.split(':').map(Number)
      slotDateTime.setHours(hour, minute, 0, 0)

      if (slotDateTime <= now) {
        slot.available = false
        slot.reason = 'Past time'
        return slot
      }

      // Check against blocked times
      for (const blockedTime of blockedTimesForDate) {
        if (blockedTime.isAllDay) {
          slot.available = false
          slot.reason = blockedTime.reason || 'Unavailable'
          return slot
        }

        if (blockedTime.startTime && blockedTime.endTime) {
          if (isTimeInRange(time, blockedTime.startTime, blockedTime.endTime)) {
            slot.available = false
            slot.reason = blockedTime.reason || 'Blocked'
            return slot
          }
        }
      }

      // Check against existing bookings
      const appointmentEndTime = addMinutesToTime(time, duration)
      
      for (const booking of existingBookings) {
        const bookingStart = booking.startTime
        const bookingEnd = booking.endTime
        
        // Check for time overlap
        if (
          (time >= bookingStart && time < bookingEnd) ||
          (appointmentEndTime > bookingStart && appointmentEndTime <= bookingEnd) ||
          (time <= bookingStart && appointmentEndTime >= bookingEnd)
        ) {
          slot.available = false
          slot.reason = 'Booked'
          return slot
        }
      }

      // Check if appointment would extend beyond working hours
      if (appointmentEndTime > workingHour.endTime) {
        slot.available = false
        slot.reason = 'Not enough time'
        return slot
      }

      return slot
    })

    return { success: availableSlots }
  } catch (error) {
    console.error("Error getting available slots:", error)
    return { error: "Failed to get available slots" }
  }
}

export async function checkSlotAvailability(
  serviceId: string, 
  date: Date, 
  startTime: string, 
  duration: number
) {
  try {
    const slots = await getAvailableSlots({ serviceId, date, duration })
    
    if (slots.error) {
      return { error: slots.error }
    }

    const requestedSlot = slots.success?.find(slot => slot.time === startTime)
    
    if (!requestedSlot) {
      return { success: false, reason: 'Time slot not found' }
    }

    return { 
      success: requestedSlot.available, 
      reason: requestedSlot.reason 
    }
  } catch (error) {
    console.error("Error checking slot availability:", error)
    return { error: "Failed to check availability" }
  }
}