"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, User, Mail, Phone, MessageSquare, Scissors } from "lucide-react"
import { CustomerInfo } from "./customer-info-step"
import { AppointmentTime } from "./appointment-time-step"

type ReviewStepProps = {
  customerInfo: CustomerInfo
  appointmentTime: AppointmentTime
  serviceName: string
  servicePrice: string
  serviceDuration: number
  serviceCategory?: string
  onNextAction: () => void
  onBackAction: () => void
  isLoading?: boolean
}

export default function ReviewStep({
  customerInfo,
  appointmentTime,
  serviceName,
  servicePrice,
  serviceDuration,
  serviceCategory,
  onNextAction,
  onBackAction,
  isLoading = false
}: ReviewStepProps) {

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const categoryConfig = {
    haircut: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "✂️" },
    beard: { color: "bg-green-100 text-green-800 border-green-300", icon: "🧔" },
    styling: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: "💇" },
    wash: { color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: "🚿" },
    treatment: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: "🧴" },
    combo: { color: "bg-pink-100 text-pink-800 border-pink-300", icon: "🎯" },
  }

  const categoryStyle = serviceCategory 
    ? categoryConfig[serviceCategory as keyof typeof categoryConfig] || {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "📋"
      }
    : {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "📋"
      }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-800">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Review Your Booking
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Please review all details before proceeding to payment
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Service Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-600" />
            Service Details
          </h3>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-bold text-xl text-slate-900">{serviceName}</h4>
                  {serviceCategory && (
                    <Badge className={`font-medium border text-xs ${categoryStyle.color}`}>
                      <span className="mr-1">{categoryStyle.icon}</span>
                      {serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-700">{servicePrice}</p>
                  <p className="text-sm text-slate-600">{serviceDuration} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Appointment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Appointment Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Date</p>
                <p className="text-blue-700 font-medium">{formatDate(appointmentTime.date)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Time</p>
                <p className="text-green-700 font-medium">{formatTime(appointmentTime.time)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600" />
            Your Information
          </h3>
          
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Name:</span>
                <span className="font-medium text-slate-900">{customerInfo.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{customerInfo.email}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Phone:</span>
                <span className="font-medium text-slate-900">{customerInfo.phone}</span>
              </div>
              
              {customerInfo.notes && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                  <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-slate-600 block">Notes:</span>
                    <span className="text-slate-900">{customerInfo.notes}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Booking Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Booking Summary</h3>
          
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-800">Total Amount:</span>
                <span className="text-3xl font-bold text-green-700">{servicePrice}</span>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-300">
                  💡 Payment required to confirm your booking
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBackAction}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Back to Edit
          </Button>
          
          <Button
            onClick={onNextAction}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 text-lg flex-1 order-1 sm:order-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}