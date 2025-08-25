import React from 'react'
import HeroSection from "@/app/homepage/HeroSection"
import { db } from "@/server"
import { services } from "@/server/schema"
import { eq, desc } from "drizzle-orm"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, ArrowRight } from "lucide-react"
import placeholder from "@/public/Barber2.jpg"

const HomePage = async () => {
  // Get featured services (top rated or most popular)
  const featuredServices = await db.query.services.findMany({
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
    limit: 6, // Show only 6 services on homepage
  })

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
    <div className='min-h-screen'>
      <HeroSection />
      
      {/* Featured Services Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Our Popular Services
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience premium barber services with our most loved treatments
          </p>
        </div>

        {featuredServices.length > 0 ? (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredServices.map((service) => {
                // Parse gallery images
                let galleryUrls: string[] = []
                try {
                  if (service.galleryUrls && service.galleryUrls !== "null") {
                    galleryUrls = JSON.parse(service.galleryUrls)
                  }
                } catch (error) {
                  galleryUrls = []
                }

                // Determine main image
                const imageUrlString = service.imageUrl ?? "";
                const hasValidImage = imageUrlString && 
                  imageUrlString !== "" && 
                  !imageUrlString.includes("placeholder") && 
                  !imageUrlString.includes("Barber2.jpg")
                
                const mainImage: string = hasValidImage ? imageUrlString : placeholder.src

                // Category styling
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
                  <Card key={service.id} className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-amber-200">
                    <div className="relative">
                      {/* Service Image - Clickable to view details */}
                      <Link href={`/services/${service.id}`}>
                        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                          <Image
                            src={mainImage}
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
                      </Link>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Service Name & Category - Clickable to view details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Link href={`/services/${service.id}`}>
                            <h3 className="font-bold text-xl text-slate-800 group-hover:text-amber-600 transition-colors cursor-pointer">
                              {service.name}
                            </h3>
                          </Link>
                          <Badge className={`font-medium border text-xs ${categoryStyle.color}`}>
                            <span className="mr-1">{categoryStyle.icon}</span>
                            {service.category 
                              ? service.category.charAt(0).toUpperCase() + service.category.slice(1)
                              : 'General'
                            }
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
                        <div className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          <div dangerouslySetInnerHTML={{ __html: service.description }} />
                        </div>
                      )}

                      {/* Book Button - Goes to booking form */}
                      <div className="pt-2">
                        <Link href={`/book/${service.id}`}>
                          <div className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-200 hover:shadow-lg cursor-pointer">
                            Book Now
                          </div>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* View All Services Button */}
            <div className="text-center">
              <Link 
                href="/services"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg group"
              >
                View All Services
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No services available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage