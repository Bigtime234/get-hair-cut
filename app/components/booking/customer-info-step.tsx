"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MessageSquare } from "lucide-react"

export type CustomerInfo = {
  name: string
  email: string
  phone: string
  notes?: string
}

type CustomerInfoStepProps = {
  initialData?: Partial<CustomerInfo>
  onNextAction: (data: CustomerInfo) => void
  onBack?: () => void
  isLoading?: boolean
}

export default function CustomerInfoStep({ 
  initialData, 
  onNextAction, 
  onBack, 
  isLoading = false 
}: CustomerInfoStepProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    notes: initialData?.notes || "",
  })

  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onNextAction(formData)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-800">
          <User className="h-6 w-6 text-amber-600" />
          Your Information
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Please provide your contact details to complete the booking
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Additional Notes (Optional)
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="notes"
                placeholder="Any special requests or notes about your appointment..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="pl-10 min-h-[100px] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="order-2 sm:order-1"
              >
                Back
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 flex-1 order-1 sm:order-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Continue to Date & Time"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}