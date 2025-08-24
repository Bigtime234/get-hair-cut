"use client"

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Define proper types based on your schema
interface VariantImage {
  id: number
  url: string
  size: number
  name: string
  order: number
  variantID: number
}

interface ProductVariant {
  id: number
  color: string
  productType: string
  variantImages: VariantImage[]
}

interface ProductShowcaseProps {
  variants: ProductVariant[]
}

export default function ProductShowcase({ variants }: ProductShowcaseProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeThumbnail, setActiveThumbnail] = useState([0])

  const updatePreview = (index: number) => {
    api?.scrollTo(index)
  }

  useEffect(() => {
    if (!api) return
    api.on("slidesInView", (e) => {
      setActiveThumbnail(e.slidesInView())
    })
  }, [api])

  // Collect all images from all variants
  const allImages: Array<{ url: string; name: string; variant: string }> = []

  variants.forEach((variant) => {
    if (variant.variantImages && variant.variantImages.length > 0) {
      // Sort images by order if available
      const sortedImages = [...variant.variantImages].sort((a, b) => 
        (a.order || 0) - (b.order || 0)
      )
      
      sortedImages.forEach((image, index) => {
        allImages.push({
          url: image.url,
          name: image.name || `${variant.color} - Image ${index + 1}`,
          variant: `${variant.color} ${variant.productType}`
        })
      })
    }
  })

  // If no images found, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-inner">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Main Carousel */}
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {allImages.map((img, index) => (
            <CarouselItem key={`main-${index}`}>
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
                <Image
                  priority={index === 0}
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  fill
                  src={img.url}
                  alt={img.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                />
                
                {/* Image overlay with variant info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Variant badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full shadow-md">
                    <span className="text-sm font-medium">{img.variant}</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows - only show if more than 1 image */}
        {allImages.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-0 shadow-lg backdrop-blur-sm" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-0 shadow-lg backdrop-blur-sm" />
          </>
        )}
      </Carousel>

      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="w-full">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {allImages.map((img, index) => (
              <div 
                key={`thumb-${index}`}
                className="flex-shrink-0"
              >
                <div
                  onClick={() => updatePreview(index)}
                  className={cn(
                    "relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2",
                    activeThumbnail.includes(index)
                      ? "border-blue-500 opacity-100 shadow-lg ring-2 ring-blue-200" 
                      : "border-slate-200 opacity-70 hover:opacity-90 hover:border-slate-300"
                  )}
                >
                  <Image
                    className="object-cover transition-transform duration-200 hover:scale-105"
                    fill
                    src={img.url}
                    alt={img.name}
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                  
                  {/* Active indicator */}
                  {activeThumbnail.includes(index) && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Image counter */}
          <div className="text-center mt-4">
            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {activeThumbnail[0] + 1} of {allImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}