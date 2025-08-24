import { db } from "@/server"
import { services } from "@/server/schema"
import { eq, desc } from "drizzle-orm"
import ServiceType from "./service-type"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users } from "lucide-react"
import placeholder from "@/public/Barber2.jpg"

export const metadata = {
  title: "Our Services - Professional Barber Services",
  description: "Discover our range of professional barber services including haircuts, beard care, styling, and treatments.",
}

export default async function ServicesPage() {
  // Enhanced querying like your product example
  const allServices = await db.query.services.findMany({
    where: eq(services.isActive, true),
    with: {
      bookings: {
        with: {
          customer: true,
          rating: true,
        },
      },
    },
    orderBy: [desc(services.averageRating), desc(services.totalRatings)],
  })

  if (!allServices || allServices.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Our Services</h1>
          <p className="text-slate-600">No services available at the moment.</p>
        </div>
      </main>
    )
  }

  // Format price helper
  const formatPrice = (price: string | number) => {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      style: "currency",
    }).format(isNaN(priceValue) ? 0 : priceValue)
  }

  // Category configuration
  const categoryConfig = {
    haircut: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "✂️" },
    beard: { color: "bg-green-100 text-green-800 border-green-300", icon: "🧔" },
    styling: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: "💇" },
    wash: { color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: "🚿" },
    treatment: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: "🧴" },
    combo: { color: "bg-pink-100 text-pink-800 border-pink-300", icon: "🎯" },
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Our Services</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Professional barber services with skilled craftsmanship. 
          Book your appointment and experience the difference.
        </p>
      </div>

      {/* Service Categories */}
      <ServiceType services={allServices} />

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allServices.map((service) => {
          // Parse gallery images
          let galleryUrls: string[] = []
          try {
            if (service.galleryUrls && service.galleryUrls !== "null") {
              galleryUrls = JSON.parse(service.galleryUrls)
            }
          } catch (error) {
            galleryUrls = []
          }

          // Determine main image - Fixed null handling
          const hasValidImage = service.imageUrl && 
            service.imageUrl !== "" && 
            !service.imageUrl.includes("placeholder") && 
            !service.imageUrl.includes("Barber2.jpg")
          
          const mainImage: string = hasValidImage ? (service.imageUrl as string) : placeholder.src

          // Category styling - Fixed undefined handling
          const categoryStyle = service.category 
            ? categoryConfig[service.category as keyof typeof categoryConfig] || {
                color: "bg-gray-100 text-gray-800 border-gray-300",
                icon: "📋"
              }
            : {
                color: "bg-gray-100 text-gray-800 border-gray-300",
                icon: "📋"
              }

          // Rating display
          const averageRating = service.averageRating ? parseFloat(service.averageRating.toString()) : 0
          const totalRatings = service.totalRatings || 0

          return (
            <Link key={service.id} href={`/${service.id}`}>
              <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-amber-200">
                <div className="relative">
                  {/* Service Image */}
                  <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                    <Image
                      src={mainImage as string}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Gallery Indicator */}
                    {galleryUrls.length > 0 && (
                      <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                        +{galleryUrls.length} photos
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full font-bold text-lg shadow-lg">
                      {formatPrice(service.price)}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Service Name & Category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl text-slate-800 group-hover:text-amber-600 transition-colors">
                        {service.name}
                      </h3>
                      <Badge className={`font-medium border text-xs ${categoryStyle.color}`}>
                        <span className="mr-1">{categoryStyle.icon}</span>
                        {service.category?.charAt(0).toUpperCase() + (service.category?.slice(1) || '')}
                      </Badge>
                    </div>

                    {/* Duration & Rating */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{service.duration} min</span>
                      </div>

                      {totalRatings > 0 ? (
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-yellow-800 text-sm">
                              {averageRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            ({totalRatings})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Star className="h-4 w-4" />
                          <span className="text-xs">New service</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <div className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      <div dangerouslySetInnerHTML={{ __html: service.description }} />
                    </div>
                  )}

                  {/* Book Button */}
                  <div className="pt-2">
                    <div className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-200 group-hover:shadow-lg">
                      Book Now
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 py-12 bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl border border-amber-100">
        <h2 className="text-2xl font-bold text-slate-800">Can't Find What You're Looking For?</h2>
        <p className="text-slate-600">
          Contact us directly and we'll be happy to discuss your specific needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact"
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
          <Link 
            href="/about"
            className="border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  )
}