"use client"

import { ServiceSchema } from "@/Types/service-schema"
import { useFieldArray, useFormContext } from "react-hook-form"
import * as z from "zod"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { Button } from "@/components/ui/button"
import { Trash, Star } from "lucide-react"
import { Reorder } from "framer-motion"
import { useState } from "react"

type ServiceFormData = z.infer<typeof ServiceSchema>

export default function ServiceImages() {
  const { getValues, control, setError, setValue } =
    useFormContext<ServiceFormData>()

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
    }
  }

  return (
    <div>
      <FormField
        control={control}
        name="galleryImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Images</FormLabel>
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
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Image</TableHead>
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
                    "text-sm font-bold text-muted-foreground hover:text-primary",
                    isMainImage && "bg-primary/5 border-l-4 border-primary"
                  )}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>
                    {(field.size / (1024 * 1024)).toFixed(2)} MB
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Image
                        src={field.url}
                        alt={field.name}
                        className="rounded-md object-cover"
                        width={72}
                        height={48}
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
                      className="scale-75"
                    >
                      <Star className={cn("h-4 w-4", isMainImage && "fill-current")} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={"ghost"}
                      onClick={(e) => {
                        e.preventDefault()
                        // If removing main image, clear main image fields
                        if (isMainImage) {
                          setValue("imageUrl", "")
                          setValue("imageKey", "")
                        }
                        remove(index)
                      }}
                      className="scale-75"
                    >
                      <Trash className="h-4" />
                    </Button>
                  </TableCell>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        </Table>
      </div>
    </div>
  )
}