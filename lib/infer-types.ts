import { InferSelectModel } from "drizzle-orm"
import { 
  users, 
  accounts, 
  sessions, 
  verificationTokens,
  services, 
  workingHours, 
  blockedTimes,
  bookings, 
  ratings, 
  notifications 
} from "@/server/schema"

// User types
export type User = InferSelectModel<typeof users>
export type Account = InferSelectModel<typeof accounts>
export type Session = InferSelectModel<typeof sessions>
export type VerificationToken = InferSelectModel<typeof verificationTokens>

// Service types
export type Service = InferSelectModel<typeof services>
export type ServicesWithImages = Service & {
  galleryUrls?: string | null
  galleryKeys?: string | null
}

// Booking system types
export type WorkingHours = InferSelectModel<typeof workingHours>
export type BlockedTime = InferSelectModel<typeof blockedTimes>
export type Booking = InferSelectModel<typeof bookings>
export type Rating = InferSelectModel<typeof ratings>
export type Notification = InferSelectModel<typeof notifications>

// Extended booking types with relations
export type BookingWithDetails = Booking & {
  customer: User
  service: Service
  rating?: Rating
}

export type BookingWithCustomer = Booking & {
  customer: User
}

export type BookingWithService = Booking & {
  service: Service
}

// Service with booking count for analytics
export type ServiceWithStats = Service & {
  bookingCount?: number
  revenueGenerated?: number
}

// User with booking history
export type UserWithBookings = User & {
  bookings: BookingWithDetails[]
}

// Rating with booking and customer details
export type RatingWithDetails = Rating & {
  booking: BookingWithService
  customer: User
}

// BOOKING WIDGET SPECIFIC TYPES
export type AvailableTimeSlot = {
  time: string // e.g., "10:00"
  available: boolean
  reason?: string // if not available
}

// Daily availability type for booking widget
export type DayAvailability = {
  date: Date
  isAvailable: boolean
  timeSlots: AvailableTimeSlot[]
  workingHours?: WorkingHours
  blockedTimes?: BlockedTime[]
}

// Service data structure for booking widget
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

// Upcoming days structure for booking widget
export type UpcomingDay = {
  date: Date
  label: string
  availableSlots: number
  slots: AvailableTimeSlot[]
}

// Booking widget form data
export type BookingWidgetData = {
  serviceId: string
  selectedDate: number
  selectedTime: string
  notes?: string
}

// Server action types for booking widget
export type BookingData = {
  serviceId: string
  customerId: string
  appointmentDate: Date
  startTime: string
  notes?: string
}

// Booking form data types
export type CreateBookingData = {
  serviceId: string
  appointmentDate: Date
  startTime: string
  notes?: string
}

export type UpdateBookingData = {
  id: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  cancelReason?: string
}

// Service form data types
export type CreateServiceData = {
  name: string
  description?: string
  price: number
  duration: number
  category?: string
  imageUrl?: string
  imageKey?: string
  galleryUrls?: string
  galleryKeys?: string
  isActive?: boolean
}

export type UpdateServiceData = CreateServiceData & {
  id: string
}

// Rating form data
export type CreateRatingData = {
  bookingId: string
  stars: number
}

// Dashboard analytics types
export type BookingAnalytics = {
  totalBookings: number
  todayBookings: number
  weeklyBookings: number
  monthlyBookings: number
  completedBookings: number
  cancelledBookings: number
  noShowBookings: number
  averageRating: number
  totalRevenue: number
  monthlyRevenue: number
}

export type ServiceAnalytics = {
  mostPopularService: Service | null
  leastPopularService: Service | null
  serviceBookingCounts: { service: Service; count: number }[]
  serviceRevenue: { service: Service; revenue: number }[]
}

export type CustomerAnalytics = {
  totalCustomers: number
  newCustomersThisMonth: number
  returningCustomers: number
  topCustomers: { customer: User; bookingCount: number }[]
}

// Notification types
export type CreateNotificationData = {
  userId: string
  title: string
  message: string
  type: string
  relatedId?: string
}

// Working hours form data
export type WorkingHoursData = {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  startTime: string
  endTime: string
  isAvailable: boolean
}

// Blocked time form data
export type BlockedTimeData = {
  date: Date
  startTime?: string
  endTime?: string
  reason?: string
  isAllDay: boolean
}

// Calendar event type for booking calendar
export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'blocked' | 'break'
  booking?: Booking
  blockedTime?: BlockedTime
}

// Form validation types
export type BookingFormErrors = {
  serviceId?: string
  appointmentDate?: string
  startTime?: string
  notes?: string
}

export type ServiceFormErrors = {
  name?: string
  description?: string
  price?: string
  duration?: string
  category?: string
}

// API Response types
export type ApiResponse<T> = {
  success?: T
  error?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Search and filter types
export type BookingFilters = {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  serviceId?: string
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export type ServiceFilters = {
  category?: string
  isActive?: boolean
  priceMin?: number
  priceMax?: number
  search?: string
}

// Time utility types
export type TimeRange = {
  start: string
  end: string
}

export type WeeklySchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: TimeRange
}

// Component prop types for booking widgets
export type BookingWidgetProps = {
  onBookNow?: () => void
  selectedService?: string
}

export type ServiceBookingWidgetProps = {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
}

// Time slot conflict checking
export type TimeSlotCheck = {
  isConflicting: boolean
  conflictType?: 'booking' | 'blocked' | 'closed'
  conflictReason?: string
}