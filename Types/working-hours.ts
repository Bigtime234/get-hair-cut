import * as z from "zod"

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Working Hours Schema
export const WorkingHoursSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.enum([
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format (HH:MM)",
  }),
  isAvailable: z.boolean().default(true),
}).refine((data) => {
  if (data.isAvailable) {
    const startMinutes = timeToMinutes(data.startTime)
    const endMinutes = timeToMinutes(data.endTime)
    return endMinutes > startMinutes
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export type zWorkingHoursSchema = z.infer<typeof WorkingHoursSchema>