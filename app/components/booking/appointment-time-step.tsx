"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { getAvailableSlots, type TimeSlot } from "@/lib/actions/get-available-slots"

export type AppointmentTime = {
  date: Date
  time: string
}

type AppointmentTimeStepProps = {
  serviceDuration: number
  initialData?: Partial<AppointmentTime>
  onNextAction: (data: AppointmentTime) => void
  onBackAction: () => void
  isLoading?: boolean
}

export default function AppointmentTimeStep({ 
  serviceDuration,
  initialData, 
  onNextAction, 
  onBackAction, 
  isLoading = false 
}: AppointmentTimeStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialData?.date || new Date()
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    initialData?.time || ""
  )
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const loadAvailableSlots = async (date: Date) => {
    setSlotsLoading(true)
    setError("")
    
    try {
      const result = await getAvailableSlots(date, serviceDuration)
      
      if ('success' in result) {
        setAvailableSlots(result.success)
      } else {
        setError(result.error)
        setAvailableSlots([])
      }
    } catch (err) {
      setError("Failed to load available time slots")
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  useEffect(() => {
    loadAvailableSlots(selectedDate)
  }, [selectedDate, serviceDuration])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime("") // Reset selected time when date changes
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = () => {
    if (!selectedTime) {
      setError("Please select a time slot")
      return
    }

    onNextAction({
      date: selectedDate,
      time: selectedTime
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString('en-NG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const availableDates = getAvailableDates()
  const availableTimeSlots = availableSlots.filter(slot => slot.available)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-800">
          <Calendar className="h-6 w-6 text-amber-600" />
          Select Date & Time
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Choose your preferred appointment date and time
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Select Date
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {availableDates.map((date, index) => {
              const isSelected = selectedDate.toDateString() === date.toDateString()
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleDateChange(date)}
                  disabled={isPast || isLoading}
                  className={`p-3 h-auto flex flex-col items-center ${
                    isSelected 
                      ? "bg-amber-600 hover:bg-amber-700 text-white" 
                      : "hover:border-amber-300"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {formatDate(date)}
                  </span>
                  <span className="text-xs opacity-75">
                    {date.toLocaleDateString('en-NG', { day: 'numeric' })}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Select Time ({serviceDuration} minutes)
          </h3>
          
          {slotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600">Loading available times...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No available times for this date</p>
              <p className="text-slate-500 text-sm">Please select a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableTimeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time
                
                return (
                  <Button
                    key={slot.time}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={isLoading}
                    className={`p-3 h-auto ${
                      isSelected 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "hover:border-green-300"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{slot.time}</span>
                      {isSelected && (
                        <CheckCircle className="h-3 w-3 mt-1" />
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Summary */}
        {selectedTime && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Selected Appointment:</span>
            </div>
            <p className="text-green-700 mt-1">
              {selectedDate.toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at {selectedTime}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBackAction}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Back
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedTime || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 flex-1 order-1 sm:order-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Continue to Review"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}