import * as z from "zod"

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Blocked Time Schema
export const BlockedTimeSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }).optional(),
  reason: z.string().max(200, { message: "Reason cannot exceed 200 characters" }).optional(),
  isAllDay: z.boolean().default(false),
}).refine((data) => {
  if (!data.isAllDay && data.startTime && data.endTime) {
    const startMinutes = timeToMinutes(data.startTime)
    const endMinutes = timeToMinutes(data.endTime)
    return endMinutes > startMinutes
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export type zBlockedTimeSchema = z.infer<typeof BlockedTimeSchema>