import ServiceType from "@/app/components/service/service-type"
import placeholder from "@/public/Barber2.jpg"
import { db } from "@/server"
import { services } from "@/server/schema"
import { eq } from "drizzle-orm"
import { Separator } from "@/components/ui/separator"
import ServiceShowcase from "@/app/components/service/service-showcase"
import ServiceRatings from "@/app/components/service/service-ratings"
import { Clock, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 60

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const data = await db.query.services.findMany({
    where: eq(services.isActive, true),
    orderBy: (services, { desc }) => [desc(services.id)],
  })
  return data.map((service) => ({
    slug: service.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await db.query.services.findFirst({
    where: eq(services.id, slug),
  })

  if (!service) {
    return {
      title: "Service Not Found",
    }
  }

  return {
    title: `${service.name} - Professional Barber Services`,
    description: service.description || `Book ${service.name} service with professional care`,
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const service = await db.query.services.findFirst({
    where: eq(services.id, slug),
    with: {
      bookings: {
        with: {
          customer: true,
        },
      },
    },
  })
  
  if (!service) {
    notFound()
  }
  
  // Format price using NGN format
  const formatPrice = (price: string | number) => {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("en-NG", {
      currency: "NGN",
      style: "currency",
    }).format(isNaN(priceValue) ? 0 : priceValue)
  }

  // Parse gallery URLs for showcase
  let galleryUrls: string[] = []
  try {
    if (service.galleryUrls && service.galleryUrls !== "null") {
      galleryUrls = JSON.parse(service.galleryUrls)
    }
  } catch (error) {
    console.error("Error parsing gallery URLs:", error)
    galleryUrls = []
  }

  // Add main image to gallery if exists
  const allImages = service.imageUrl 
    ? [service.imageUrl, ...galleryUrls] 
    : galleryUrls

  // Category configuration
  const categoryConfig = {
    haircut: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "✂️" },
    beard: { color: "bg-green-100 text-green-800 border-green-300", icon: "🧔" },
    styling: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: "💇" },
    wash: { color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: "🚿" },
    treatment: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: "🧴" },
    combo: { color: "bg-pink-100 text-pink-800 border-pink-300", icon: "🎯" },
  }

  // Category styling with proper null checks
  const categoryStyle = service.category 
    ? categoryConfig[service.category as keyof typeof categoryConfig] || {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "📋"
      }
    : {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "📋"
      }
    
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="flex flex-col lg:flex-row gap-4 lg:gap-12">
        <div className="flex-1">
          <ServiceShowcase images={allImages} serviceName={service.name} />
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="space-y-4">
            {/* Service Header */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-800">{service.name}</h1>
              
              {/* Category and Status */}
              <div className="flex items-center gap-3">
                <Badge className={`font-medium border ${categoryStyle.color}`}>
                  <span className="mr-1">{categoryStyle.icon}</span>
                  {service.category 
                    ? service.category.charAt(0).toUpperCase() + service.category.slice(1)
                    : 'General'
                  }
                </Badge>
                
                <Badge 
                  variant={service.isActive ? "default" : "secondary"} 
                  className={service.isActive 
                    ? "bg-green-100 text-green-800 border-green-300" 
                    : "bg-gray-100 text-gray-600 border-gray-300"
                  }
                >
                  {service.isActive ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />
            
            {/* Price and Duration */}
            <div className="space-y-4">
              <div id="price-display">
                <p className="text-3xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  {formatPrice(service.price)}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-lg">{service.duration} minutes</span>
                </div>
                
                {/* Rating Display */}
                <div className="flex items-center gap-2">
                  {service.totalRatings && service.totalRatings > 0 ? (
                    <>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-yellow-800 text-lg">
                          {service.averageRating ? parseFloat(service.averageRating.toString()).toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        ({service.totalRatings} ratings)
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Star className="h-5 w-5" />
                      <span className="text-sm">No ratings yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            {/* Description */}
            {service.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800">Service Description</h3>
                <div
                  className="text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </div>
            )}
          </div>

          <Separator className="my-6" />
          
          {/* Book Now Button - Links to booking form */}
          {service.isActive && (
            <div className="mt-6">
              <Link 
                href={`/book/${service.id}`}
                className="block w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 px-6 rounded-lg text-center transition-all duration-200 hover:shadow-lg text-lg"
              >
                Book This Service Now
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Service Ratings Section */}
      <div className="mt-12">
        <ServiceRatings serviceId={service.id} />
      </div>
    </main>
  )
}