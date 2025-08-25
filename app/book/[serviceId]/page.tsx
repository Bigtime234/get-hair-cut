// UPDATED FILE: app/book/[serviceId]/page.tsx
import { db } from '@/server'
import { services } from "@/server/schema"
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import MultiStepBookingForm from "@/app/components/booking/multi-step-booking-form"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'

// Generate static params for all active services
export async function generateStaticParams(): Promise<{ serviceId: string }[]> {
  if (process.env.SKIP_STATIC_GENERATION === 'true') {
    console.log('⏭️  Skipping static generation (SKIP_STATIC_GENERATION=true)')
    return []
  }

  try {
    console.log('🔍 Fetching services for static generation...')
    
    const data = await db.query.services.findMany({
      where: eq(services.isActive, true),
      orderBy: (services, { desc }) => [desc(services.createdAt)],
      columns: {
        id: true,
        name: true,
      }
    })

    console.log(`✅ Found ${data.length} active services for static generation`)
    
    if (data.length === 0) {
      console.log('⚠️  No services found. Database might need seeding.')
      console.log('💡 Run: npm run db:setup')
    }

    return data.map(service => {
      console.log(`  📄 Generating static page for: ${service.name} (${service.id})`)
      return {
        serviceId: service.id,
      }
    })

  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error)
    
    if (error instanceof Error && error.message.includes('relation "services" does not exist')) {
      console.log('💡 Database tables not found. Please run migrations:')
      console.log('   npm run db:push')
      console.log('   npm run db:setup')
    }
    
    console.log('🔄 Falling back to dynamic rendering')
    return []
  }
}

// Configure dynamic behavior
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 3600 // Revalidate every hour

interface BookingPageProps {
  params: {
    serviceId: string
  }
}

// Loading component
function BookingFormSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Service Header Skeleton */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Step Indicator Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                  {index < 3 && <Skeleton className="w-12 h-0.5 mx-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main booking content component
async function BookingPageContent({ serviceId }: { serviceId: string }) {
  try {
    // Fetch the specific service
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })

    if (!service) {
      notFound()
    }

    if (!service.isActive) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center justify-center gap-2">
                  <CalendarDays className="h-6 w-6" />
                  Service Unavailable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-6">
                  This service is currently unavailable for booking.
                </p>
                <a 
                  href="/services" 
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                >
                  Browse Available Services
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    // Prepare service data for the form
    const serviceData = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      imageUrl: service.imageUrl,
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Book Your Appointment
          </h1>
          <p className="text-lg text-slate-600">
            Complete the form below to secure your slot
          </p>
        </div>
        
        <MultiStepBookingForm service={serviceData} />
      </div>
    )

  } catch (error) {
    console.error('Error loading booking page:', error)
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center justify-center gap-2">
                <CalendarDays className="h-6 w-6" />
                Error Loading Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-6">
                There was an error loading this service. Please try again.
              </p>
              <a 
                href="/services" 
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Back to Services
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

// Main page component
export default function BookingPage({ params }: BookingPageProps) {
  const { serviceId } = params

  return (
    <Suspense fallback={<BookingFormSkeleton />}>
      <BookingPageContent serviceId={serviceId} />
    </Suspense>
  )
}