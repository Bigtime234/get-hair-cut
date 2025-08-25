"use server"

import { db } from "@/server"
import { users, bookings, services } from "@/server/schema"
import { eq, and } from "drizzle-orm"
import { createId } from '@paralleldrive/cuid2'
import { CustomerInfo } from '@/app/components/booking/customer-info-step'
import { AppointmentTime } from  "@/app/components/booking/appointment-time-step"

// Your existing types and functions
export type BookingData = {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceId: string
  appointmentDate: Date
  startTime: string
  endTime: string
  totalPrice: number
  notes?: string
}

// Your existing createBooking function (unchanged)
export async function createBooking(data: BookingData): Promise<
  { success: { bookingId: string; customerId: string } } | { error: string }
> {
  try {
    // Validate required fields
    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      return { error: "All customer information is required" }
    }

    if (!data.serviceId || !data.appointmentDate || !data.startTime || !data.endTime) {
      return { error: "Service and appointment details are required" }
    }

    // Check if service exists and is active
    const service = await db.query.services.findFirst({
      where: eq(services.id, data.serviceId),
    })

    if (!service) {
      return { error: "Service not found" }
    }

    if (!service.isActive) {
      return { error: "Service is not available for booking" }
    }

    // Check if time slot is still available
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.serviceId, data.serviceId),
        eq(bookings.appointmentDate, data.appointmentDate),
        eq(bookings.startTime, data.startTime)
      ),
    })

    if (existingBooking) {
      return { error: "Time slot is no longer available" }
    }

    // Find or create customer
    let customer = await db.query.users.findFirst({
      where: eq(users.email, data.customerEmail),
    })

    let customerId: string

    if (!customer) {
      // Create new customer
      const newCustomerId = createId()
      
      const [newCustomer] = await db.insert(users).values({
        id: newCustomerId,
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()

      if (!newCustomer) {
        return { error: "Failed to create customer record" }
      }

      customerId = newCustomer.id
    } else {
      customerId = customer.id
      
      // Update customer info if provided details are different
      if (customer.name !== data.customerName || customer.phone !== data.customerPhone) {
        await db.update(users)
          .set({
            name: data.customerName,
            phone: data.customerPhone,
            updatedAt: new Date(),
          })
          .where(eq(users.id, customerId))
      }
    }

    // Create booking
    const bookingId = createId()
    
    const [newBooking] = await db.insert(bookings).values({
      id: bookingId,
      customerId: customerId,
      serviceId: data.serviceId,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'pending',
      totalPrice: data.totalPrice.toString(),
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    if (!newBooking) {
      return { error: "Failed to create booking" }
    }

    return { 
      success: { 
        bookingId: newBooking.id,
        customerId: customerId
      } 
    }

  } catch (error) {
    console.error("Error creating booking:", error)
    return { error: "Failed to create booking. Please try again." }
  }
}

// Your existing helper functions (unchanged)
export async function calculateEndTime(startTime: string, durationMinutes: number): Promise<string> {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + durationMinutes
  
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}

export async function formatBookingDate(date: Date): Promise<string> {
  return date.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function formatBookingTime(startTime: string, endTime: string): Promise<string> {
  return `${startTime} - ${endTime}`
}

// NEW: Adapter function to bridge your existing createBooking with the form data
type FormBookingData = {
  serviceId: string
  customerInfo: CustomerInfo
  appointmentTime: AppointmentTime
}

export async function createBookingAction(data: FormBookingData) {
  try {
    console.log('Creating booking with form data:', data)

    // Get service details to calculate price and end time
    const service = await db.query.services.findFirst({
      where: eq(services.id, data.serviceId),
    })

    if (!service) {
      return { error: "Service not found" }
    }

    // Create appointment datetime
    const appointmentDateTime = new Date(data.appointmentTime.date)
    const [hours, minutes] = data.appointmentTime.time.split(':')
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes))

    // Calculate end time using your helper function
    const endTime = await calculateEndTime(data.appointmentTime.time, service.duration)

    // Transform form data to match your existing BookingData type
    const bookingData: BookingData = {
      customerName: data.customerInfo.name,
      customerEmail: data.customerInfo.email,
      customerPhone: data.customerInfo.phone,
      serviceId: data.serviceId,
      appointmentDate: appointmentDateTime,
      startTime: data.appointmentTime.time,
      endTime: endTime,
      totalPrice: parseFloat(service.price),
      notes: data.customerInfo.notes || undefined,
    }

    // Use your existing createBooking function
    const result = await createBooking(bookingData)

    if ('error' in result) {
      return { error: result.error }
    }

    console.log('Booking created successfully:', result.success.bookingId)

    return { 
      success: true, 
      bookingId: result.success.bookingId,
      redirectUrl: `/booking/processing?bookingId=${result.success.bookingId}`
    }

  } catch (error) {
    console.error('Error in createBookingAction:', error)
    return { 
      error: "Failed to create booking. Please try again." 
    }
  }
}

// Get service details function for the booking page
export async function getServiceDetailsAction(serviceId: string) {
  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })

    if (!service) {
      return { error: "Service not found" }
    }

    if (!service.isActive) {
      return { error: "Service is not available" }
    }

    return { 
      success: true, 
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        imageUrl: service.imageUrl,
      }
    }
  } catch (error) {
    console.error('Error fetching service:', error)
    return { error: "Failed to load service details" }
  }
}