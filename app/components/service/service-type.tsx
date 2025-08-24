"use client"
import { ServicesWithImages } from "@/lib/infer-types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ServiceTypeProps = {
  services: ServicesWithImages[]
}

export default function ServiceType({ services }: ServiceTypeProps) {
  // Get unique categories from services - fixed null checking
  const categories = Array.from(
    new Set(
      services
        .map(service => service.category)
        .filter((category): category is string => Boolean(category))
    )
  )
 
  // Category configuration with icons and colors
  const categoryConfig = {
    haircut: {
      color: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
      icon: "✂️",
      label: "Haircuts"
    },
    beard: {
      color: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
      icon: "🧔",
      label: "Beard Care"
    },
    styling: {
      color: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200",
      icon: "💇",
      label: "Hair Styling"
    },
    wash: {
      color: "bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200",
      icon: "🚿",
      label: "Hair Wash"
    },
    treatment: {
      color: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
      icon: "🧴",
      label: "Treatments"
    },
    combo: {
      color: "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200",
      icon: "🎯",
      label: "Combo Deals"
    },
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800">Service Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const config = categoryConfig[category as keyof typeof categoryConfig] || {
            color: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
            icon: "📋",
            label: category.charAt(0).toUpperCase() + category.slice(1)
          }
         
          const serviceCount = services.filter(service => service.category === category).length
         
          return (
            <Badge
              key={category}
              className={cn(
                "font-medium border cursor-pointer transition-colors duration-200 px-3 py-1 text-sm",
                config.color
              )}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
              {serviceCount > 1 && (
                <span className="ml-1 text-xs opacity-75">({serviceCount})</span>
              )}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}