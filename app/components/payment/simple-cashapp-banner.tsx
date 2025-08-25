"use client"

import { useState } from "react"
import { Copy, Check, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CASH_APP_CONFIG, getFullCashTag } from "@/lib/utils/cashapp-config"

type SimpleCashAppBannerProps = {
  serviceName: string
  servicePrice: string
  onCompleteBookingAction: () => Promise<void> // Server Action signature
  isProcessing?: boolean
}

export default function SimpleCashAppBanner({ 
  serviceName, 
  servicePrice, 
  onCompleteBookingAction,
  isProcessing = false
}: SimpleCashAppBannerProps) {
  const [copied, setCopied] = useState(false)
  
  const cashTag = getFullCashTag()
  
  const handleCopyTag = async () => {
    try {
      await navigator.clipboard.writeText(cashTag)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleCompleteBooking = async () => {
    try {
      await onCompleteBookingAction()
    } catch (error) {
      console.error("Booking completion error:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CreditCard className="h-5 w-5" />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Service:</span>
              <span className="font-bold text-slate-900">{serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-700">{servicePrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash App Payment Details */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            💳 Send Payment To
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cash App Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cash App Name:</label>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <span className="font-bold text-lg text-slate-900">
                {CASH_APP_CONFIG.displayName}
              </span>
            </div>
          </div>

          {/* Cash App Tag */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cash App Tag:</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-white rounded-lg border border-blue-200 font-mono text-lg font-bold text-slate-900">
                {cashTag}
              </div>
              <Button
                onClick={handleCopyTag}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-blue-300 hover:bg-blue-100"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Instructions:</strong> {CASH_APP_CONFIG.instructions}
              </p>
              {CASH_APP_CONFIG.note && (
                <p className="text-xs text-amber-700 mt-2">
                  <strong>Note:</strong> {CASH_APP_CONFIG.note}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Booking Button */}
      <div className="pt-4">
        <Button
          onClick={handleCompleteBooking}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            "Complete Booking"
          )}
        </Button>
      </div>

      {/* Payment Status */}
      <div className="text-center">
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">
          💡 We'll contact you once payment is confirmed
        </Badge>
      </div>
    </div>
  )
}