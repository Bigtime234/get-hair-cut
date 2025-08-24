"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { MoreHorizontal, Images, Clock, Star, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useAction } from "next-safe-action/hooks"
import { deleteService } from "@/lib/actions/delete-service"
import { toast } from "sonner"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { ServiceGallery } from "./service-gallery"
import { ServicesWithImages } from "@/lib/infer-types"
import { cn } from "@/lib/utils"

type ServiceColumn = {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  image: string
  averageRating: number
  totalRatings: number
  isActive: boolean
  serviceData?: ServicesWithImages // Pass the full service data
}

type ActionResult = {
  data?: {
    error?: string
    success?: string
  }
}

const ActionCell = ({ row }: { row: Row<ServiceColumn> }) => {
  const router = useRouter()
  
  const { status, execute } = useAction(deleteService, {
    onSuccess: (data: ActionResult) => {
      toast.dismiss()
      
      if (data?.data?.error) {
        toast.error(data.data.error)
      }
      if (data?.data?.success) {
        toast.success(data.data.success)
        router.refresh()
      }
    },
    onExecute: () => {
      toast.loading("Deleting Service...", {
        id: "delete-service",
      })
    },
    onError: (error) => {
      toast.dismiss("delete-service")
      toast.error("Failed to delete service")
      console.error("Delete error:", error)
    },
  })
  
  const service = row.original

  const handleDelete = () => {
    try {
      execute({ id: service.id })
    } catch (error) {
      toast.dismiss("delete-service")
      toast.error("Failed to delete service")
      console.error("Delete error:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 rounded-lg">
          <MoreHorizontal className="h-5 w-5 text-slate-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-semibold text-slate-800">Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            href={`/dashboard/add-service?id=${service.id}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Edit className="h-4 w-4 text-blue-600" />
            Edit Service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          {service.isActive ? (
            <>
              <EyeOff className="h-4 w-4 text-orange-600" />
              Deactivate
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-green-600" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={status === "executing"}
          className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          {status === "executing" ? "Deleting..." : "Delete Service"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Enhanced Image cell component with gallery management
const ImageCell = ({ row }: { row: Row<ServiceColumn> }) => {
  const cellImage = row.getValue("image") as string
  const serviceName = row.getValue("name") as string
  const service = row.original
  const serviceData = service.serviceData
  const isPlaceholder = cellImage.includes("Barber2.jpg") || cellImage.includes("placeholder")
  
  // Check if service has gallery images
  const hasGalleryImages = serviceData?.galleryUrls && 
    serviceData.galleryUrls !== "null" && 
    serviceData.galleryUrls !== "[]"
  
  const galleryCount = hasGalleryImages && typeof serviceData.galleryUrls === "string"
    ? (JSON.parse(serviceData.galleryUrls).length || 0)
    : 0
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group-hover:shadow-md transition-all">
          <Image
            src={cellImage}
            alt={serviceName || 'Service image'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Overlay for placeholder images */}
          {isPlaceholder && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-6 w-6 text-white" />
            </div>
          )}
          
          {/* Gallery indicator */}
          {galleryCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              {galleryCount}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ServiceGallery serviceId={service.id} service={serviceData}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "h-9 px-3 text-xs font-medium transition-all",
                    isPlaceholder || galleryCount === 0
                      ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100' 
                      : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  )}
                >
                  <Images className="h-4 w-4 mr-1" />
                  {galleryCount > 0 ? `${galleryCount} Images` : 'Add Images'}
                </Button>
              </ServiceGallery>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {galleryCount > 0 
                  ? `Manage gallery (${galleryCount} images)` 
                  : 'Add service images'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Quick edit link */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/add-service?id=${service.id}`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600 hover:text-slate-800">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit service details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export const columns: ColumnDef<ServiceColumn>[] = [
  {
    accessorKey: "name",
    header: "Service Details",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const description = row.original.description
      const isActive = row.original.isActive
      
      return (
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{name}</span>
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={cn(
                "text-xs",
                isActive 
                  ? "bg-green-100 text-green-800 border-green-300" 
                  : "bg-gray-100 text-gray-600 border-gray-300"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-slate-600 line-clamp-2 max-w-[300px]">
              {description}
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      const categoryConfig = {
        haircut: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "✂️" },
        beard: { color: "bg-green-100 text-green-800 border-green-300", icon: "🧔" },
        styling: { color: "bg-purple-100 text-purple-800 border-purple-300", icon: "💇" },
        wash: { color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: "🚿" },
        treatment: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: "🧴" },
        combo: { color: "bg-pink-100 text-pink-800 border-pink-300", icon: "🎯" },
      }
      
      const config = categoryConfig[category as keyof typeof categoryConfig] || {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "📋"
      }
      
      return (
        <Badge className={cn("font-medium border", config.color)}>
          <span className="mr-1">{config.icon}</span>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const priceValue = row.getValue("price")
      const price = typeof priceValue === 'string' ? parseFloat(priceValue) : (priceValue as number)
      const formatted = new Intl.NumberFormat("en-NG", {
        currency: "NGN",
        style: "currency",
      }).format(isNaN(price) ? 0 : price)
      return (
        <div className="font-bold text-lg text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200 text-center min-w-[100px]">
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number
      return (
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="font-medium">{duration} min</span>
        </div>
      )
    },
  },
  {
    accessorKey: "averageRating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("averageRating") as number
      const totalRatings = row.original.totalRatings
      
      if (totalRatings === 0) {
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <Star className="h-4 w-4" />
            <span className="text-sm">No ratings</span>
          </div>
        )
      }
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-yellow-800">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-500">({totalRatings})</span>
        </div>
      )
    },
  },
  {
    accessorKey: "image",
    header: "Images",
    cell: ImageCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]