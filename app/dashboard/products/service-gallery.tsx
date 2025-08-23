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
import { Trash, Star } from "lucide-react"
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
    <div className="space-y-4">
      <FormField
        control={control}
        name="galleryImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload Service Images</FormLabel>
            <FormControl>
              <UploadDropzone
                className=" ut-allowed-content:text-secondary-foreground ut-label:text-primary ut-upload-icon:text-primary/50 hover:bg-primary/10 transition-all duration-500 ease-in-out border-secondary ut-button:bg-primary/75 ut-button:ut-readying:bg-secondary "
                onUploadError={(error) => {
                  console.log(error)
                  setError("galleryImages", {
                    type: "validate",
                    message: error.message,
                  })
                  return
                }}
                onBeforeUploadBegin={(files) => {
                  files.map((file) =>
                    append({
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
                  return
                }}
                config={{ mode: "auto" }}
                endpoint="variantUploader"
              />
            </FormControl>
            <FormDescription>
              Upload images for your service. The first image will become the main image.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {fields.length > 0 && (
        <div className="rounded-md overflow-x-auto border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Main Image</TableHead>
                <TableHead>Actions</TableHead>
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
                return (
                  <Reorder.Item
                    as="tr"
                    key={field.id}
                    value={field}
                    id={field.id}
                    onDragStart={() => setActive(index)}
                    className={cn(
                      field.url.search("blob:") === 0
                        ? "animate-pulse transition-all"
                        : "",
                      "text-sm font-bold text-muted-foreground hover:text-primary cursor-move",
                      isMainImage && "bg-primary/5 border-l-4 border-primary"
                    )}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{field.name}</TableCell>
                    <TableCell>
                      {(field.size / (1024 * 1024)).toFixed(2)} MB
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Image
                          src={field.url}
                          alt={field.name}
                          className="rounded-md object-cover border"
                          width={60}
                          height={40}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={isMainImage ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          setMainImage(index)
                        }}
                        className="h-8"
                      >
                        <Star className={cn("h-3 w-3", isMainImage && "fill-current")} />
                        {isMainImage && <span className="ml-1 text-xs">Main</span>}
                      </Button>
                    </TableCell>
                    <TableCell>
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
                        }}
                        className="h-8 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          </Table>
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

    const setEdit = useCallback(() => {
      if (service) {
        // Parse gallery URLs and Keys if they exist
        let galleryUrls: string[] = []
        let galleryKeys: string[] = []
        
        try {
          galleryUrls = service.galleryUrls ? JSON.parse(service.galleryUrls) : []
          galleryKeys = service.galleryKeys ? JSON.parse(service.galleryKeys) : []
        } catch (error) {
          console.error("Error parsing gallery data:", error)
        }

        // Map URLs and Keys to gallery images format
        const galleryImages = galleryUrls.map((url, index) => ({
          url,
          key: galleryKeys[index] || "",
          name: `Gallery Image ${index + 1}`,
          size: 0, // Size not stored, using placeholder
        }))

        form.reset({
          serviceId: service.id,
          imageUrl: service.imageUrl || "",
          imageKey: service.imageKey || "",
          galleryImages,
          galleryKeys,
        })
      } else {
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
        setEdit()
      }
    }, [setEdit, open])

    const { execute, status } = useAction(updateServiceGallery, {
      onExecute() {
        toast.loading("Updating service gallery...")
        setOpen(false)
      },
      onSuccess(data: ActionResult) {
        toast.dismiss()
        
        if (data?.data?.error) {
          toast.error(data.data.error)
        }
        if (data?.data?.success) {
          toast.success(data.data.success)
          router.refresh() // Refresh to show updated images
        }
      },
      onError(error) {
        toast.dismiss()
        toast.error("Failed to update gallery")
        console.error("Update gallery error:", error)
      },
    })

    function onSubmit(values: ServiceGalleryFormData) {
      // Extract URLs and keys from gallery images
      const galleryUrls = values.galleryImages.map(img => img.url)
      const galleryKeysArray = values.galleryImages.map(img => img.key || "")
      
      execute({
        serviceId: values.serviceId,
        imageUrl: values.imageUrl,
        imageKey: values.imageKey,
        galleryImages: values.galleryImages,
        galleryUrls: JSON.stringify(galleryUrls),
        galleryKeys: values.galleryKeys, // Use the tags from the form, not from images
      })
    }

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen)
      if (!newOpen) {
        setTimeout(() => {
          setEdit()
        }, 100)
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Manage Service Gallery</DialogTitle>
            <DialogDescription>
              Upload and organize images for your service. Set a main image and add gallery photos.
              You can drag images to reorder them.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="galleryKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery Tags</FormLabel>
                    <FormControl>
                      <InputTags
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Add descriptive tags for your service gallery (e.g., "haircut", "styling", "before-after")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <ServiceGalleryImages />
              
              <div className="flex gap-4 items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {form.watch("galleryImages").length} images uploaded
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[120px]"
                    disabled={status === "executing"}
                  >
                    {status === "executing" ? "Updating..." : "Update Gallery"}
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