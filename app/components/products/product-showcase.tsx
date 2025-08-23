"use client"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ServicesWithImages } from "@/lib/infer-types"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ServiceShowcaseProps {
  services: ServicesWithImages[]
}

export default function ServiceShowcase({ services }: ServiceShowcaseProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeThumbnail, setActiveThumbnail] = useState([0])
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || services[0]?.category
  
  const updatePreview = (index: number) => {
    api?.scrollTo(index)
  }
  
  useEffect(() => {
    if (!api) return
    api.on("slidesInView", (e) => {
      setActiveThumbnail(e.slidesInView())
    })
  }, [api])

  // Filter services by selected category and get gallery images
  const filteredServices = services.filter((service) => 
    !selectedCategory || service.category === selectedCategory
  )

  // Get all images from filtered services
  const allImages: Array<{ url: string; name: string }> = []
  
  filteredServices.forEach((service) => {
    // Add main image if exists
    if (service.imageUrl) {
      allImages.push({
        url: service.imageUrl,
        name: service.name
      })
    }
    
    // Add gallery images if exist
    if (service.galleryUrls) {
      try {
        const galleryUrls = JSON.parse(service.galleryUrls)
        galleryUrls.forEach((url: string, index: number) => {
          allImages.push({
            url,
            name: `${service.name} - Gallery ${index + 1}`
          })
        })
      } catch (error) {
        console.error("Error parsing gallery URLs:", error)
      }
    }
  })

  if (allImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
        <span className="text-gray-500">No images available</span>
      </div>
    )
  }
  
  return (
    <Carousel setApi={setApi} opts={{ loop: true }}>
      <CarouselContent>
        {allImages.map((img, index) => (
          <CarouselItem key={`${img.url}-${index}`}>
            <Image
              priority={index === 0}
              className="rounded-md"
              width={1280}
              height={720}
              src={img.url}
              alt={img.name}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex overflow-clip py-2 gap-4">
        {allImages.map((img, index) => (
          <div key={`thumb-${img.url}-${index}`}>
            <Image
              onClick={() => updatePreview(index)}
              priority={index < 4}
              className={cn(
                index === activeThumbnail[0]
                  ? "opacity-100"
                  : "opacity-75",
                "rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:opacity-75"
              )}
              width={72}
              height={48}
              src={img.url}
              alt={img.name}
            />
          </div>
        ))}
      </div>
    </Carousel>
  )
}