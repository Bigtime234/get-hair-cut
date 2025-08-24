"use client"

import { ServicesWithImages } from "@/lib/infer-types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ServiceGallerySchema } from "@/Types/service-gallery"
import { InputTags } from "./input-tags"
import { useAction } from "next-safe-action/hooks"
import { updateServiceGallery } from "@/lib/actions/update-service-gallery"
import { toast } from "sonner"
import { forwardRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useFieldArray, useFormContext } from "react-hook-form"
import { UploadDropzone } from "@/app/api/uploadthing/upload"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Trash, Star, ImageIcon } from "lucide-react"
import { Reorder } from "framer-motion"
import { useRouter } from "next/navigation"

type ServiceGalleryProps = {
  children: React.ReactNode
  serviceId: string
  service?: ServicesWithImages
}

type ActionResult = {
  data?: {
    error?: string
    success?: string
  }
}

// Create a corrected schema that matches what the form expects
const CorrectedServiceGallerySchema = z.object({
  serviceId: z.string().min(1, { message: "Service ID is required" }),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  galleryImages: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    size: z.number(),
    url: z.string(),
    key: z.string().optional(),
  })),
  galleryUrls: z.string().optional(),
  galleryKeys: z.array(z.string()),
})

type ServiceGalleryFormData = z.infer<typeof CorrectedServiceGallerySchema>

// Custom ServiceImages component for ServiceGallery form
function ServiceGalleryImages() {
  const { control, getValues, setError, setValue } = useFormContext<ServiceGalleryFormData>()

  const { fields, remove, append, update, move } = useFieldArray({
    control,
    name: "galleryImages",
  })

  const [active, setActive] = useState(0)

  const setMainImage = (index: number) => {
    const images = getValues("galleryImages")
    const mainImage = images[index]
    if (mainImage) {
      setValue("imageUrl", mainImage.url)
      setValue("imageKey", mainImage.key || "")
      toast.success("Main image updated!")
    }
  }

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="galleryImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-600" />
              Upload Service Images
            </FormLabel>
            <FormControl>
              <UploadDropzone
                className="border-2 border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-all duration-300 rounded-xl ut-allowed-content:text-slate-600 ut-label:text-amber-800 ut-label:text-lg ut-upload-icon:text-amber-600 ut-button:bg-gradient-to-r ut-button:from-amber-600 ut-button:to-amber-700 ut-button:hover:from-amber-700 ut-button:hover:to-amber-800 ut-button:text-white ut-button:font-semibold ut-button:px-6 ut-button:py-3 ut-button:rounded-lg ut-button:shadow-lg ut-button:ut-readying:bg-amber-400"
                onUploadError={(error) => {
                  console.log(error)
                  setError("galleryImages", {
                    type: "validate",
                    message: error.message,
                  })
                  toast.error("Upload failed: " + error.message)
                  return
                }}
                onBeforeUploadBegin={(files) => {
                  files.map((file) =>
                    append({
                      id: crypto.randomUUID(),
                      name: file.name,
                      size: file.size,
                      url: URL.createObjectURL(file),
                    })
                  )
                  return files
                }}
                onClientUploadComplete={(files) => {
                  const images = getValues("galleryImages")
                  if (images) {
                    images.map((field, imgIDX) => {
                      if (field.url.search("blob:") === 0) {
                        const image = files.find((img) => img.name === field.name)
                        if (image) {
                          update(imgIDX, {
                            ...field,
                            url: image.url,
                            name: image.name,
                            size: image.size,
                            key: image.key,
                          })
                          // Set first uploaded image as main image if none set
                          if (imgIDX === 0 && !getValues("imageUrl")) {
                            setValue("imageUrl", image.url)
                            setValue("imageKey", image.key)
                            toast.success("First image set as main image!")
                          }
                        }
                      }
                    })
                  }
                  toast.success(`Successfully uploaded ${files.length} image(s)!`)
                  return
                }}
                config={{ mode: "auto" }}
                endpoint="variantUploader"
              />
            </FormControl>
            <FormDescription className="text-slate-600">
              Upload high-quality images for your service. The first image will become the main display image.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {fields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Gallery Images ({fields.length})</h3>
            <div className="text-sm text-slate-600">Drag to reorder</div>
          </div>
          
          <div className="rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700 w-16">Order</TableHead>
                  <TableHead className="font-semibold text-slate-700">Image</TableHead>
                  <TableHead className="font-semibold text-slate-700">Details</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Main Image</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center w-20">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <Reorder.Group
                as="tbody"
                values={fields}
                onReorder={(e) => {
                  const activeElement = fields[active]
                  e.map((item, index) => {
                    if (item === activeElement) {
                      move(active, index)
                      setActive(index)
                      return
                    }
                    return
                  })
                }}
              >
                {fields.map((field, index) => {
                  const isMainImage = getValues("imageUrl") === field.url
                  const isUploading = field.url.search("blob:") === 0
                  
                  return (
                    <Reorder.Item
                      as="tr"
                      key={field.id}
                      value={field}
                      id={field.id}
                      onDragStart={() => setActive(index)}
                      className={cn(
                        "hover:bg-slate-50 transition-colors cursor-move border-b border-slate-100",
                        isUploading && "animate-pulse bg-blue-50",
                        isMainImage && "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500"
                      )}
                    >
                      <TableCell className="font-bold text-slate-600">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-sm">
                          {index + 1}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="relative group">
                          <Image
                            src={field.url}
                            alt={field.name}
                            className="rounded-lg object-cover border-2 border-slate-200 shadow-sm group-hover:shadow-md transition-shadow"
                            width={80}
                            height={60}
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                            </div>
                          )}
                          {isMainImage && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                              Main
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-800 max-w-[200px] truncate" title={field.name}>
                            {field.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {(field.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button
                          variant={isMainImage ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setMainImage(index)
                          }}
                          className={cn(
                            "h-10 px-4",
                            isMainImage 
                              ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md" 
                              : "border-amber-300 text-amber-700 hover:bg-amber-50"
                          )}
                          disabled={isUploading}
                        >
                          <Star className={cn("h-4 w-4", isMainImage && "fill-current")} />
                          <span className="ml-1 text-xs">{isMainImage ? "Main" : "Set"}</span>
                        </Button>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            // If removing main image, clear main image fields
                            if (isMainImage) {
                              setValue("imageUrl", "")
                              setValue("imageKey", "")
                              toast.info("Main image cleared")
                            }
                            remove(index)
                            toast.success("Image removed")
                          }}
                          className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={isUploading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

export const ServiceGallery = forwardRef<HTMLDivElement, ServiceGalleryProps>(
  ({ children, serviceId, service }, ref) => {
    const router = useRouter()
    const form = useForm<ServiceGalleryFormData>({
      resolver: zodResolver(CorrectedServiceGallerySchema),
      defaultValues: {
        serviceId,
        galleryImages: [],
        galleryKeys: [],
        imageUrl: "",
        imageKey: "",
      },
    })

    const [open, setOpen] = useState(false)

    const setEdit = useCallback(async () => {
      if (service) {
        console.log("🔄 Loading service data:", service)
        
        // Parse gallery URLs and Keys if they exist
        let galleryUrls: string[] = []
        let galleryKeys: string[] = []
        
        try {
          if (service.galleryUrls && service.galleryUrls !== "null") {
            galleryUrls = JSON.parse(service.galleryUrls)
            console.log("📸 Parsed gallery URLs:", galleryUrls)
          }
          
          if (service.galleryKeys && service.galleryKeys !== "null") {
            galleryKeys = JSON.parse(service.galleryKeys)
            console.log("🏷️ Parsed gallery keys:", galleryKeys)
          }
        } catch (error) {
          console.error("❌ Error parsing gallery data:", error)
          galleryUrls = []
          galleryKeys = []
        }

        // Map URLs and Keys to gallery images format with proper data
        const galleryImages = galleryUrls.map((url, index) => ({
          id: `existing-${index}`,
          url,
          key: galleryKeys[index] || "",
          name: `Gallery Image ${index + 1}`,
          size: 0, // Size not stored for existing images
        }))

        console.log("🖼️ Mapped gallery images:", galleryImages)

        form.reset({
          serviceId: service.id,
          imageUrl: service.imageUrl || "",
          imageKey: service.imageKey || "",
          galleryImages,
          galleryKeys: Array.isArray(galleryKeys) ? galleryKeys : [],
        })
        
        console.log("✅ Form reset with existing data")
      } else {
        console.log("🆕 No service data, resetting to defaults")
        form.reset({
          serviceId,
          galleryImages: [],
          galleryKeys: [],
          imageUrl: "",
          imageKey: "",
        })
      }
    }, [service, form, serviceId])

    useEffect(() => {
      if (open) {
        console.log("🔓 Dialog opened, loading data...")
        setEdit()
      }
    }, [setEdit, open])

    const { execute, status } = useAction(updateServiceGallery, {
      onExecute() {
        toast.loading("Updating service gallery...", {
          id: "update-gallery"
        })
        setOpen(false)
      },
      onSuccess(data: ActionResult) {
        toast.dismiss("update-gallery")
        
        if (data?.data?.error) {
          toast.error(data.data.error)
        }
        if (data?.data?.success) {
          toast.success(data.data.success)
          router.refresh() // Refresh to show updated images
        }
      },
      onError(error) {
        toast.dismiss("update-gallery")
        toast.error("Failed to update gallery")
        console.error("Update gallery error:", error)
      },
    })

    function onSubmit(values: ServiceGalleryFormData) {
      console.log("📤 Submitting gallery update:", values)
      
      // Extract URLs and keys from gallery images
      const galleryUrls = values.galleryImages.map(img => img.url)
      const galleryKeysFromImages = values.galleryImages.map(img => img.key || "").filter(Boolean)
      
      // Combine gallery keys (tags) with keys from images
      const allKeys = [...new Set([...values.galleryKeys, ...galleryKeysFromImages])]
      
      execute({
        serviceId: values.serviceId,
        imageUrl: values.imageUrl,
        imageKey: values.imageKey,
        galleryImages: values.galleryImages,
        galleryUrls: JSON.stringify(galleryUrls),
        galleryKeys: allKeys,
      })
    }

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form when closing to ensure fresh state next time
        setTimeout(() => {
          form.reset()
        }, 100)
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              Manage Service Gallery
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-lg">
              Upload and organize images for your service. Set a main image and add gallery photos.
              You can drag images to reorder them.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
              <FormField
                control={form.control}
                name="galleryKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-slate-800">
                      Gallery Tags
                    </FormLabel>
                    <FormControl>
                      <InputTags
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-600">
                      Add descriptive tags for your service gallery (e.g., "haircut", "styling", "before-after")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <ServiceGalleryImages />
              
              <div className="flex gap-4 items-center justify-between pt-6 border-t bg-slate-50 -mx-6 px-6 py-4 -mb-6">
                <div className="text-slate-600 font-medium">
                  {form.watch("galleryImages").length} image{form.watch("galleryImages").length !== 1 ? 's' : ''} in gallery
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[140px] bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold px-6 py-2 shadow-lg"
                    disabled={status === "executing"}
                  >
                    {status === "executing" ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Gallery"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }
)

ServiceGallery.displayName = "ServiceGallery"