// NEW FILE: app/components/booking/live-booking-widget.tsx
// CREATE THIS FILE: app/components/booking/live-booking-widget.tsx
// Live booking widget adapted for your barber service system

"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Phone, User, CheckCircle } from 'lucide-react'
import { getAvailableSlots } from '@/lib/actions/get-available-slots'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type LiveBookingWidgetProps = {
  serviceId: string
  serviceName: string
  servicePrice: string | number
  serviceDuration: number
}

type TimeSlot = {
  time: string
  available: boolean
  reason?: string
}

type DateOption = {
  id: number
  label: string
  date: Date
  slots: TimeSlot[]
}

export default function LiveBookingWidget({ 
  serviceId, 
  serviceName, 
  servicePrice, 
  serviceDuration 
}: LiveBookingWidgetProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<DateOption[]>([])
  const [loading, setLoading] = useState(true)

  // Format price
  const formatPrice = (price: string | number) => {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      style: "currency",
    }).format(isNaN(priceValue) ? 0 : priceValue)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Load available slots
  useEffect(() => {
    async function loadAvailableSlots() {
      try {
        setLoading(true)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        
        const dates = [
          { id: 0, label: 'Today', date: today },
          { id: 1, label: 'Tomorrow', date: tomorrow }
        ]

        const datesWithSlots: DateOption[] = []
        
        for (const dateOption of dates) {
          const result = await getAvailableSlots({
            serviceId,
            date: dateOption.date,
            duration: serviceDuration
          })
          
          if (result.success) {
            datesWithSlots.push({
              ...dateOption,
              slots: result.success
            })
          } else {
            datesWithSlots.push({
              ...dateOption,
              slots: []
            })
          }
        }
        
        setAvailableDates(datesWithSlots)
      } catch (error) {
        console.error('Error loading slots:', error)
        toast.error('Failed to load available times')
      } finally {
        setLoading(false)
      }
    }

    loadAvailableSlots()
  }, [serviceId, serviceDuration])

  const handleBooking = () => {
    if (!session) {
      toast.error('Please sign in to book an appointment')
      router.push('/auth/signin')
      return
    }

    if (!selectedTime) {
      toast.error('Please select a time slot')
      return
    }

    const selectedDateOption = availableDates[selectedDate]
    if (!selectedDateOption) {
      toast.error('Please select a date')
      return
    }

    // Navigate to booking confirmation or create booking directly
    const bookingData = {
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration,
      selectedDate: selectedDateOption.date,
      selectedTime,
    }

    // Store in session storage for booking flow
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push('/booking/confirm')
  }

  const availableSlots = availableDates[selectedDate]?.slots || []

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          Book Your Appointment
        </CardTitle>
        <div className="space-y-2">
          <p className="text-slate-600">
            Reserve your slot for <span className="font-semibold">{serviceName}</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{serviceDuration} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-green-600">{formatPrice(servicePrice)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-slate-200 rounded"></div>
                <div className="h-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">
                Select Date
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {availableDates.map((dateOption) => (
                  <motion.button
                    key={dateOption.id}
                    onClick={() => {
                      setSelectedDate(dateOption.id)
                      setSelectedTime(null) // Reset time when date changes
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedDate === dateOption.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md' 
                        : 'border-slate-300 hover:border-amber-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {dateOption.label}
                      </div>
                      <div className="text-sm opacity-80">
                        {formatDate(dateOption.date)}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="mt-2 text-xs"
                      >
                        {dateOption.slots.filter(slot => slot.available).length} available
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">
                Available Times
              </h3>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No available times</p>
                  <p className="text-slate-400 text-sm">Please select a different date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <motion.button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        selectedTime === slot.time
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : slot.available
                            ? 'border-slate-300 hover:border-amber-300 bg-white hover:bg-amber-50 text-slate-700'
                            : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      whileHover={slot.available ? { scale: 1.02 } : {}}
                      whileTap={slot.available ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      {!slot.available && slot.reason && (
                        <div className="text-xs mt-1 opacity-75">
                          {slot.reason}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Actions */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
              <Button
                onClick={handleBooking}
                disabled={!selectedTime || loading}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 text-lg shadow-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {selectedTime ? `Book ${selectedTime} - ${formatPrice(servicePrice)}` : 'Select Time to Book'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/contact')}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call to Book
              </Button>
            </div>

            {/* Live Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">
                  Live availability - Updated in real-time
                </span>
              </div>
            </div>

            {/* Auth Notice */}
            {!session && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700 text-sm">
                    <span className="font-medium">Sign in required:</span> Please login to complete your booking
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}