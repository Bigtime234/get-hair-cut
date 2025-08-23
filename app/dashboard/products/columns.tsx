"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { MoreHorizontal, Images, Clock, Star, Plus } from "lucide-react"

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
import { ServiceGallery } from "./service-gallery" // Import your ServiceGallery component
import { ServicesWithImages } from "@/lib/infer-types" // Import your types

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
        <Button variant={"ghost"} className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
          <Link href={`/dashboard/add-service?id=${service.id}`}>
            Edit Service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
          disabled={status === "executing"}
        >
          {status === "executing" ? "Deleting..." : "Delete Service"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Image cell component with gallery management
const ImageCell = ({ row }: { row: Row<ServiceColumn> }) => {
  const cellImage = row.getValue("image") as string
  const serviceName = row.getValue("name") as string
  const service = row.original
  const isPlaceholder = cellImage.includes("Barber2.jpg") || cellImage.includes("placeholder")
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <Image
          src={cellImage}
          alt={serviceName || 'Service image'}
          width={50}
          height={50}
          className="rounded-md object-cover"
        />
        
        {/* Overlay for placeholder images */}
        {isPlaceholder && (
          <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ServiceGallery serviceId={service.id}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 ${isPlaceholder ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
                >
                  {isPlaceholder ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Images className="h-4 w-4" />
                  )}
                </Button>
              </ServiceGallery>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaceholder ? 'Add service images' : 'Manage service gallery'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Edit service link */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/add-service?id=${service.id}`}>
                <Button variant="ghost" size="sm" className="h-6 w-8 p-0">
                  <span className="text-xs">Edit</span>
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
    header: "Service Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const isActive = row.original.isActive
      
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {!isActive && <Badge variant="secondary">Inactive</Badge>}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      const categoryColors = {
        haircut: "bg-blue-100 text-blue-800",
        beard: "bg-green-100 text-green-800",
        styling: "bg-purple-100 text-purple-800",
        wash: "bg-cyan-100 text-cyan-800",
        treatment: "bg-orange-100 text-orange-800",
        combo: "bg-pink-100 text-pink-800",
      }
      
      return (
        <Badge 
          variant="secondary" 
          className={categoryColors[category as keyof typeof categoryColors] || ""}
        >
          {category}
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
      return <div className="font-medium text-sm">{formatted}</div>
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-sm">{duration}min</span>
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
        return <span className="text-gray-500 text-sm">No ratings</span>
      }
      
      return (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({totalRatings})</span>
        </div>
      )
    },
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ImageCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]
