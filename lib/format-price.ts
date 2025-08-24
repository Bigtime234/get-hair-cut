// lib/format-price.ts
export default function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(isNaN(price) ? 0 : price)
}

// lib/review-average.ts (renamed from review-avarage.ts for consistency)
export function getReviewAverage(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 0
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  const average = sum / ratings.length
  
  return Math.round(average * 10) / 10 // Round to 1 decimal place
}

// Calculate star distribution from ratings array
export function getStarDistribution(ratings: number[]): Record<number, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution]++
    }
  })
  
  return distribution
}

// Calculate rating percentage for each star level
export function getRatingPercentages(ratings: number[]): Record<number, number> {
  const distribution = getStarDistribution(ratings)
  const total = ratings.length
  
  if (total === 0) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  return {
    1: Math.round((distribution[1] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    5: Math.round((distribution[5] / total) * 100),
  }
}

// lib/date-utils.ts
export function formatAppointmentDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatAppointmentTime(time: string): string {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  
  return `${hour12}:${minutes} ${ampm}`
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

export function getDayLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// lib/booking-utils.ts
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  
  const endHours = endDate.getHours().toString().padStart(2, '0')
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
  
  return `${endHours}:${endMinutes}`
}

export function isTimeSlotAvailable(
  slotTime: string,
  serviceDuration: number,
  existingBookings: Array<{ startTime: string; endTime: string }>,
  blockedTimes: Array<{ startTime?: string; endTime?: string; isAllDay: boolean }>
): { available: boolean; reason?: string } {
  // Check if all day is blocked
  if (blockedTimes.some(blocked => blocked.isAllDay)) {
    return { available: false, reason: 'Day is blocked' }
  }
  
  const slotStart = new Date(`2000-01-01 ${slotTime}`)
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)
  
  // Check against existing bookings
  for (const booking of existingBookings) {
    const bookingStart = new Date(`2000-01-01 ${booking.startTime}`)
    const bookingEnd = new Date(`2000-01-01 ${booking.endTime}`)
    
    // Check for overlap
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return { available: false, reason: 'Already booked' }
    }
  }
  
  // Check against blocked times
  for (const blocked of blockedTimes) {
    if (blocked.startTime && blocked.endTime) {
      const blockedStart = new Date(`2000-01-01 ${blocked.startTime}`)
      const blockedEnd = new Date(`2000-01-01 ${blocked.endTime}`)
      
      // Check for overlap
      if (slotStart < blockedEnd && slotEnd > blockedStart) {
        return { available: false, reason: 'Time blocked' }
      }
    }
  }
  
  return { available: true }
}

// Generate available time slots for a given day
export function generateTimeSlots(
  workingHours: { startTime: string; endTime: string },
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01 ${workingHours.startTime}`)
  const end = new Date(`2000-01-01 ${workingHours.endTime}`)
  
  let current = new Date(start)
  
  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5) // HH:MM format
    slots.push(timeString)
    current.setMinutes(current.getMinutes() + intervalMinutes)
  }
  
  return slots
}