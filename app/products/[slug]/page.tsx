// app/products/[slug]/page.tsx (Barber Services Booking)
import { db } from "@/server"
import { productVariants } from "@/server/schema"
import { eq } from "drizzle-orm"
import { Separator } from "@/components/ui/separator"
import formatPrice from "@/lib/format-price"
import ProductShowcase from "@/app/components/products/product-showcase"
import Reviews from "@/app/components/reviews/reviews"
import { getReviewAverage } from "@/lib/review-avarage"
import { motion } from "framer-motion"
import { Clock, Star, Calendar, Phone } from "lucide-react"
import { useState } from "react"

export const revalidate = 60

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const data = await db.query.productVariants.findMany({
    with: {
      variantImages: true,
      variantTags: true,
      product: true,
    },
    orderBy: (productVariants, { desc }) => [desc(productVariants.id)],
  })
  return data.map((variant) => ({
    slug: variant.id.toString(),
  }))
}

// Live Booking Widget Component (similar to your LiveBookingWidget)
function ServiceBookingWidget({ service, price }: { service: any; price: number }) {
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])

  const dates = [
    {
      id: 0,
      label: 'Today',
      date: new Date(),
      slots: ['10:00 AM', '2:00 PM', '4:30 PM']
    },
    {
      id: 1,
      label: 'Tomorrow', 
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      slots: ['9:00 AM', '11:30 AM', '1:00 PM', '3:30 PM', '5:00 PM']
    }
  ]

  const formatDate = (date: Date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleBookNow = () => {
    if (selectedTime) {
      // Handle booking logic here
      console.log(`Booking ${service.title} for ${dates[selectedDate].label} at ${selectedTime}`)
      // Redirect to booking confirmation or payment
    }
  }

  React.useEffect(() => {
    setAvailableSlots(dates[selectedDate]?.slots || [])
    setSelectedTime("")
  }, [selectedDate])

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
      {/* Service Info Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
          {service.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <div className="text-2xl font-bold text-green-700">
              {formatPrice(price)}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-700">45 mins</span>
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
            <Star className="h-5 w-5 text-amber-500 fill-current" />
            <span className="font-semibold text-amber-700">4.8 (124)</span>
          </div>
        </div>

        {service.description && (
          <div 
            className="text-slate-600 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        )}
      </div>

      <Separator className="my-6" />

      {/* Date Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Select Date
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {dates.map((dateOption) => (
            <button
              key={dateOption.id}
              onClick={() => setSelectedDate(dateOption.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                selectedDate === dateOption.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                  : 'border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {dateOption.label}
                </div>
                <div className="text-sm opacity-80">
                  {formatDate(dateOption.date)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          Available Times
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {availableSlots.map((slot, index) => (
            <motion.button
              key={slot}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedTime(slot)}
              className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                selectedTime === slot
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                  : 'border-slate-200 hover:border-green-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{slot}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Booking Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleBookNow}
          disabled={!selectedTime}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
            selectedTime
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Calendar className="h-5 w-5" />
          {selectedTime ? `Book for ${selectedTime}` : 'Select Time to Book'}
        </button>
        
        <button 
          onClick={() => window.location.href = '/contact'}
          className="sm:w-auto whitespace-nowrap flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
        >
          <Phone className="h-5 w-5" />
          Call to Book
        </button>
      </div>

      {/* Live Status */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 font-medium">
            Live availability - Updated every 5 minutes
          </span>
        </div>
      </div>
    </div>
  )
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const search = searchParams ? await searchParams : {}
  
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, Number(slug)),
    with: {
      product: {
        with: {
          reviews: true,
          productVariants: {
            with: {
              variantImages: true,
              variantTags: true,
            },
          },
        },
      },
    },
  })

  // Query related services for recommendations
  const relatedServices = await db.query.productVariants.findMany({
    with: {
      variantImages: true,
      variantTags: true,
      product: true,
    },
    orderBy: (productVariants, { desc }) => [desc(productVariants.id)],
    limit: 8,
  })
  
  if (!variant) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Service Not Found</h1>
          <p className="text-gray-600 mt-2">
            The service with ID "{slug}" could not be found.
          </p>
        </div>
      </main>
    )
  }
  
  const reviewAvg = getReviewAverage(
    variant.product.reviews.map((r) => r.rating)
  )
    
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Main Service Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Service Images */}
          <div className="flex-1">
            <ProductShowcase variants={variant.product.productVariants} />
          </div>
          
          {/* Booking Widget */}
          <div className="flex-1">
            <ServiceBookingWidget 
              service={variant.product} 
              price={variant.product.price}
            />
          </div>
        </div>
      </section>

      {/* Related Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Other Barber Services
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover more professional barber services for your grooming needs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedServices
                .filter(service => service.id !== variant.id)
                .slice(0, 8)
                .map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                        {service.variantImages?.[0]?.url ? (
                          <img
                            src={service.variantImages[0].url}
                            alt={service.product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <div className="text-6xl">✂️</div>
                          </div>
                        )}
                        
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 rounded-full shadow-lg">
                          <span className="text-sm font-bold">
                            {formatPrice(Number(service.product.price))}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {service.product.title}
                        </h3>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-green-500 rounded-full"></div>
                          <p className="text-sm text-slate-600 uppercase font-medium tracking-wide">
                            {service.productType}
                          </p>
                        </div>

                        <a
                          href={`/products/${service.id}`}
                          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          Book This Service
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            <div className="text-center mt-12">
              <a
                href="/services"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>View All Services</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <Reviews productID={variant.productID} />
        </div>
      </section>
    </main>
  )
}