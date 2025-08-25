import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Phone, Mail, Home } from "lucide-react"
import Link from "next/link"

type BookingProcessingContentProps = {
  bookingId?: string
}

function BookingProcessingContent({ bookingId }: BookingProcessingContentProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Booking Submitted!</h1>
            <p className="text-lg text-slate-600">
              Your appointment request is being processed
            </p>
          </div>

          {/* Status Card */}
          <Card className="mb-8 border-2 border-green-200 bg-white shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="h-5 w-5" />
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Booking Reference */}
              {bookingId && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Booking Reference:</p>
                  <Badge variant="outline" className="text-lg font-mono px-4 py-2 bg-slate-50">
                    {bookingId}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-2">
                    Keep this reference for your records
                  </p>
                </div>
              )}

              {/* Status Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Booking Request Submitted</p>
                    <p className="text-sm text-slate-600">Your appointment details have been received</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Awaiting Payment Confirmation</p>
                    <p className="text-sm text-slate-600">We're waiting to receive your Cash App payment</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Confirmation Call</p>
                    <p className="text-sm text-slate-500">We'll contact you once payment is verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="mb-8 border border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                What Happens Next?
              </h3>
              <div className="space-y-3 text-blue-700">
                <p className="flex items-start gap-2">
                  <span className="font-medium">1.</span>
                  <span>We'll receive notification of your Cash App payment</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-medium">2.</span>
                  <span>Our team will verify the payment and confirm your booking</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-medium">3.</span>
                  <span>You'll receive a confirmation call with appointment details</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-medium">4.</span>
                  <span>We'll send you a reminder before your appointment</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8 border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Mail className="h-5 w-5 text-amber-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-slate-600 mb-4">
                If you have any questions about your booking or payment, please don't hesitate to contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Phone:</span>
                  <span>+234 XXX XXX XXXX</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Email:</span>
                  <span>info@yourbarber.com</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            
            <Link 
              href="/services"
              className="flex-1 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white font-semibold py-3 px-6 rounded-lg text-center transition-all"
            >
              Book Another Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function BookingProcessingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Loading...</h1>
          <p className="text-slate-600">Please wait while we process your booking</p>
        </div>
      </div>
    </main>
  )
}

export default async function BookingProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : undefined

  return (
    <Suspense fallback={<BookingProcessingFallback />}>
      <BookingProcessingContent bookingId={bookingId} />
    </Suspense>
  )
}