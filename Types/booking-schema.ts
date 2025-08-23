import * as z from "zod"

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Booking Schema
export const BookingSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, { message: "Customer is required" }),
  serviceId: z.string().min(1, { message: "Service is required" }),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }).refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, { message: "Appointment date cannot be in the past" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }),
  status: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .default('pending'),
  totalPrice: z.number().min(0),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional(),
  cancelReason: z.string().optional(),
})

export type zBookingSchema = z.infer<typeof BookingSchema>

// Booking Filter Schema
export const BookingFilterSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  serviceId: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
})

export type zBookingFilterSchema = z.infer<typeof BookingFilterSchema>