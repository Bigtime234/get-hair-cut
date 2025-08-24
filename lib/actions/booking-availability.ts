"use server"

import { db } from "@/server"
import { services, bookings, workingHours, blockedTimes } from "@/server/schema"
import { eq, and, gte, lte, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type AvailableTimeSlot = {
  time: string
  available: boolean
  reason?: string
}

export type ServiceWithAvailability = {
  id: string
  name: string
  description: string | null
  price: string
  duration: number
  category: string | null
  imageUrl: string | null
  averageRating: string | null
  totalRatings: number | null
  isActive: boolean
}

export type BookingData = {
  serviceId: string
  customerId: string
  appointmentDate: Date
  startTime: string
  notes?: string
}

// Get all active services for booking widget
export async function getAvailableServices(): Promise<ServiceWithAvailability[]> {
  try {
    const activeServices = await db.query.services.findMany({
      where: eq(services.isActive, true),
      orderBy: [desc(services.averageRating), desc(services.totalRatings)],
    })

    return activeServices.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      imageUrl: service.imageUrl,
      averageRating: service.averageRating,
      totalRatings: service.totalRatings,
      isActive: service.isActive,
    }))
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

// Get working hours for a specific day
export async function getWorkingHoursForDay(dayOfWeek: string) {
  try {
    const workingHour = await db.query.workingHours.findFirst({
      where: and(
        eq(workingHours.dayOfWeek, dayOfWeek as any),
        eq(workingHours.isAvailable, true)
      )
    })
    return workingHour
  } catch (error) {
    console.error("Error fetching working hours:", error)
    return null
  }
}

// Get blocked times for a specific date
export async function getBlockedTimesForDate(date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const blocked = await db.query.blockedTimes.findMany({
      where: and(
        gte(blockedTimes.date, startOfDay),
        lte(blockedTimes.date, endOfDay)
      )
    })
    
    return blocked
  } catch (error) {
    console.error("Error fetching blocked times:", error)
    return []
  }
}

// Get existing bookings for a specific date
export async function getBookingsForDate(date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingBookings = await db.query.bookings.findMany({
      where: and(
        gte(bookings.appointmentDate, startOfDay),
        lte(bookings.appointmentDate, endOfDay),
        // Only confirmed and pending bookings block slots
        eq(bookings.status, 'confirmed') || eq(bookings.status, 'pending')
      ),
      with: {
        service: true
      }
    })
    
    return existingBookings
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

// Generate time slots between start and end time
function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  
  let current = new Date(start)
  
  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5) // HH:MM format
    slots.push(timeString)
    current.setMinutes(current.getMinutes() + intervalMinutes)
  }
  
  return slots
}

// Check if a time slot conflicts with existing bookings
function isTimeSlotConflicting(
  slotTime: string,
  serviceDuration: number,
  existingBookings: any[]
): boolean {
  const slotStart = new Date(`2000-01-01 ${slotTime}`)
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)
  
  return existingBookings.some(booking => {
    const bookingStart = new Date(`2000-01-01 ${booking.startTime}`)
    const bookingEnd = new Date(`2000-01-01 ${booking.endTime}`)
    
    // Check for overlap
    return (slotStart < bookingEnd && slotEnd > bookingStart)
  })
}

// Check if time slot is blocked
function isTimeSlotBlocked(slotTime: string, blockedTimes: any[]): boolean {
  return blockedTimes.some(blocked => {
    if (blocked.isAllDay) return true
    
    if (blocked.startTime && blocked.endTime) {
      const slotTimeDate = new Date(`2000-01-01 ${slotTime}`)
      const blockedStart = new Date(`2000-01-01 ${blocked.startTime}`)
      const blockedEnd = new Date(`2000-01-01 ${blocked.endTime}`)
      
      return slotTimeDate >= blockedStart && slotTimeDate < blockedEnd
    }
    
    return false
  })
}

// Get available time slots for a specific date and service
export async function getAvailableTimeSlots(
  date: Date,
  serviceId?: string
): Promise<AvailableTimeSlot[]> {
  try {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    // Get working hours for the day
    const workingHour = await getWorkingHoursForDay(dayOfWeek)
    if (!workingHour) {
      return []
    }
    
    // Get service duration if serviceId provided
    let serviceDuration = 30 // default 30 minutes
    if (serviceId) {
      const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId)
      })
      if (service) {
        serviceDuration = service.duration
      }
    }
    
    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots(workingHour.startTime, workingHour.endTime, 30)
    
    // Get blocked times and existing bookings
    const [blockedTimes, existingBookings] = await Promise.all([
      getBlockedTimesForDate(date),
      getBookingsForDate(date)
    ])
    
    // Check availability for each slot
    const availableSlots: AvailableTimeSlot[] = allTimeSlots.map(slot => {
      let available = true
      let reason = ''
      
      // Check if slot is blocked
      if (isTimeSlotBlocked(slot, blockedTimes)) {
        available = false
        reason = 'Time blocked'
      }
      
      // Check if slot conflicts with existing bookings
      if (available && isTimeSlotConflicting(slot, serviceDuration, existingBookings)) {
        available = false
        reason = 'Already booked'
      }
      
      // Check if slot is in the past for today's date
      if (available) {
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        
        if (isToday) {
          const slotDateTime = new Date(`${date.toDateString()} ${slot}`)
          if (slotDateTime <= today) {
            available = false
            reason = 'Past time'
          }
        }
      }
      
      return {
        time: slot,
        available,
        reason: available ? undefined : reason
      }
    })
    
    return availableSlots
    
  } catch (error) {
    console.error("Error getting available time slots:", error)
    return []
  }
}

// Create a new booking
export async function createBooking(bookingData: BookingData) {
  try {
    // Get service details
    const service = await db.query.services.findFirst({
      where: eq(services.id, bookingData.serviceId)
    })
    
    if (!service) {
      return { error: "Service not found" }
    }
    
    // Calculate end time
    const startTime = new Date(`2000-01-01 ${bookingData.startTime}`)
    const endTime = new Date(startTime.getTime() + service.duration * 60000)
    const endTimeString = endTime.toTimeString().slice(0, 5)
    
    // Check if slot is still available
    const availableSlots = await getAvailableTimeSlots(bookingData.appointmentDate, bookingData.serviceId)
    const requestedSlot = availableSlots.find(slot => slot.time === bookingData.startTime)
    
    if (!requestedSlot || !requestedSlot.available) {
      return { error: "Selected time slot is no longer available" }
    }
    
    // Create the booking
    const newBooking = await db.insert(bookings).values({
      customerId: bookingData.customerId,
      serviceId: bookingData.serviceId,
      appointmentDate: bookingData.appointmentDate,
      startTime: bookingData.startTime,
      endTime: endTimeString,
      totalPrice: service.price,
      notes: bookingData.notes || null,
      status: 'pending'
    }).returning()
    
    revalidatePath('/dashboard/bookings')
    revalidatePath('/')
    
    return { success: "Booking created successfully", booking: newBooking[0] }
    
  } catch (error) {
    console.error("Error creating booking:", error)
    return { error: "Failed to create booking" }
  }
}

// Get next 7 days with availability
export async function getUpcomingAvailability(serviceId?: string) {
  try {
    const today = new Date()
    const upcomingDays = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const availableSlots = await getAvailableTimeSlots(date, serviceId)
      const availableCount = availableSlots.filter(slot => slot.available).length
      
      upcomingDays.push({
        date,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        availableSlots: availableCount,
        slots: availableSlots.filter(slot => slot.available).slice(0, 8) // Show first 8 available slots
      })
    }
    
    return upcomingDays
    
  } catch (error) {
    console.error("Error getting upcoming availability:", error)
    return []
  }
}