// NEW FILE: app/components/services/service-showcase.tsx
// CREATE THIS FILE: app/components/services/service-showcase.tsx
// Service image carousel/gallery component

"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import placeholder from "@/public/Barber2.jpg"

type ServiceShowcaseProps = {
  images: string[]
  serviceName: string
}

export default function ServiceShowcase({ images, serviceName }: ServiceShowcaseProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Filter out empty or placeholder images and add fallback
  const validImages = images.filter(img => img && img.trim() !== "") 
  const displayImages = validImages.length > 0 ? validImages : [placeholder.src]
  
  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }
  
  const handleNextImage = () => {
    setSelectedImageIndex(prev => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative group">
        <div className="aspect-square w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-50">
          <Image
            src={displayImages[selectedImageIndex]}
            alt={`${serviceName} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          
          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          )}
          
          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-6 w-6 text-slate-700" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Thumbnail Navigation */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                selectedImageIndex === index
                  ? "border-amber-500 ring-2 ring-amber-200 scale-110"
                  : "border-slate-300 hover:border-amber-300 hover:scale-105"
              )}
            >
              <Image
                src={image}
                alt={`${serviceName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* No Images Placeholder */}
      {validImages.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
          <ImageIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No images available for this service</p>
          <p className="text-slate-400 text-sm">Using placeholder image</p>
        </div>
      )}
    </div>
  )
}