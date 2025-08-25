"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import CustomerInfoStep, { CustomerInfo } from "./customer-info-step"
import AppointmentTimeStep, { AppointmentTime } from "./appointment-time-step"
import ReviewStep from "./review-step"
import SimpleCashAppBanner from "../payment/simple-cashapp-banner"
import { createBookingAction } from "@/lib/actions/create-booking"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, CheckCircle, User } from "lucide-react"

type BookingStep = 'customer-info' | 'appointment-time' | 'review' | 'payment'

type Service = {
  id: string
  name: string
  description?: string | null
  price: string
  duration: number
  category?: string | null
  imageUrl?: string | null
}

type MultiStepBookingFormProps = {
  service: Service
}

export default function MultiStepBookingForm({ service }: MultiStepBookingFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<BookingStep>('customer-info')
  const [isLoading, setIsLoading] = useState(false)
  
  // Form data
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  
  const [appointmentTime, setAppointmentTime] = useState<AppointmentTime>({
    date: new Date(),
    time: "",
  })

  // Format price for display
  const formatPrice = (price: string) => {
    const priceValue = parseFloat(price)
    return new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      style: "currency",
    }).format(isNaN(priceValue) ? 0 : priceValue)
  }

  // Step navigation
  const handleCustomerInfoNext = (data: CustomerInfo) => {
    setCustomerInfo(data)
    setCurrentStep('appointment-time')
  }

  const handleAppointmentTimeNext = (data: AppointmentTime) => {
    setAppointmentTime(data)
    setCurrentStep('review')
  }

  const handleReviewNext = () => {
    setCurrentStep('payment')
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'appointment-time':
        setCurrentStep('customer-info')
        break
      case 'review':
        setCurrentStep('appointment-time')
        break
      case 'payment':
        setCurrentStep('review')
        break
      default:
        break
    }
  }

  // Complete booking
  const handleCompleteBookingAction = async () => {
    setIsLoading(true)
    
    try {
      const result = await createBookingAction({
        serviceId: service.id,
        customerInfo,
        appointmentTime,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success && result.redirectUrl) {
        toast.success("Booking created successfully!")
        router.push(result.redirectUrl)
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step indicator
  const steps = [
    { id: 'customer-info', label: 'Your Info', icon: User },
    { id: 'appointment-time', label: 'Date & Time', icon: Calendar },
    { id: 'review', label: 'Review', icon: CheckCircle },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Service Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-slate-800">{service.name}</CardTitle>
              {service.description && (
                <p className="text-slate-600">{service.description}</p>
              )}
              {service.category && (
                <Badge variant="secondary" className="w-fit">
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-700">{formatPrice(service.price)}</div>
              <div className="text-sm text-slate-600">{service.duration} minutes</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isDisabled = index > currentStepIndex

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${isDisabled ? 'opacity-50' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive 
                        ? 'bg-amber-600 border-amber-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      isActive ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-slate-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'customer-info' && (
          <CustomerInfoStep
            initialData={customerInfo}
            onNextAction={handleCustomerInfoNext}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'appointment-time' && (
          <AppointmentTimeStep
            serviceDuration={service.duration}
            initialData={appointmentTime}
            onNextAction={handleAppointmentTimeNext}
            onBackAction={handleBack}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            customerInfo={customerInfo}
            appointmentTime={appointmentTime}
            serviceName={service.name}
            servicePrice={formatPrice(service.price)}
            serviceDuration={service.duration}
            serviceCategory={service.category || undefined}
            onNextAction={handleReviewNext}
            onBackAction={handleBack}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CreditCard className="h-6 w-6 text-amber-600" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleCashAppBanner
                serviceName={service.name}
                servicePrice={formatPrice(service.price)}
                onCompleteBookingAction={handleCompleteBookingAction}
                isProcessing={isLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}