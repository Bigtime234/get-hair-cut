"use client"

import { useForm } from "react-hook-form"
import { zServiceSchema, ServiceSchema } from "@/Types/service-schema"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { createService } from "@/lib/actions/create-service"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getService } from "@/lib/actions/get-service"
import { TbCurrencyNaira } from "react-icons/tb"
import { Clock, FileText } from "lucide-react"
import { useEffect, useState } from "react"

export default function ServiceForm() {
  const [characterCount, setCharacterCount] = useState(0)
  const maxCharacters = 500

  const form = useForm<zServiceSchema>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      category: "",
      galleryImages: [],
      isActive: true,
    },
    mode: "onChange",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get("id")

  const checkService = async (id: string) => {
    if (editMode) {
      const data = await getService(id)
      if (data.error) {
        toast.error(data.error)
        router.push("/dashboard/products")
        return
      }
      if (data.success) {
        form.setValue("name", data.success.name)
        form.setValue("description", data.success.description || "")
        form.setValue("price", parseFloat(data.success.price))
        form.setValue("duration", data.success.duration)
        form.setValue("category", data.success.category || "")
        form.setValue("isActive", data.success.isActive)
        
        // Handle galleryImages - convert from database strings to array format
        if (data.success.galleryUrls && data.success.galleryUrls.trim() !== '') {
          try {
            // Split comma-separated URLs
            const urls = data.success.galleryUrls.split(',').filter(url => url.trim() !== '')
            const keys = data.success.galleryKeys ? data.success.galleryKeys.split(',').filter(key => key.trim() !== '') : []
            
            const galleryImages = urls.map((url: string, index: number) => ({
              name: `image-${index + 1}`,
              size: 0,
              url: url.trim(),
              id: `${id}-${index}`,
              key: keys[index]?.trim() || undefined
            }))
            form.setValue("galleryImages", galleryImages)
          } catch (e) {
            console.error('Error parsing gallery data:', e)
            form.setValue("galleryImages", [])
          }
        } else {
          form.setValue("galleryImages", [])
        }
        
        form.setValue("id", id)
        
        // Set optional fields if they exist
        if (data.success.imageUrl) form.setValue("imageUrl", data.success.imageUrl)
        if (data.success.imageKey) form.setValue("imageKey", data.success.imageKey)
        if (data.success.galleryUrls) form.setValue("galleryUrls", data.success.galleryUrls)
        if (data.success.galleryKeys) form.setValue("galleryKeys", data.success.galleryKeys)
        
        // Update character count for description
        setCharacterCount(data.success.description?.length || 0)
      }
    }
  }

  useEffect(() => {
    if (editMode) {
      checkService(editMode)
    }
  }, [editMode])

  const { execute, status } = useAction(createService, {
    onSuccess: (data) => {
      toast.dismiss()
      
      if (data?.data?.error) {
        toast.error(data.data.error)
      }
      if (data?.data?.success) {
        toast.success(data.data.success)
        router.push("/dashboard/products")
      }
    },
    onError: (error) => {
      toast.dismiss()
      toast.error("Something went wrong")
    },
    onExecute: () => {
      if (editMode) {
        toast.loading("Updating Service...")
      } else {
        toast.loading("Creating Service...")
      }
    },
  })

  const onSubmit = async (values: zServiceSchema) => {
    execute(values)
  }

  const handleDescriptionChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setCharacterCount(value.length)
      return value
    }
    return value.substring(0, maxCharacters)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {editMode ? "Edit Service" : "Create New Service"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {editMode
            ? "Make changes to your existing barber service"
            : "Add a brand new service to your barbershop offerings"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Service Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Premium Haircut & Style" 
                      className="h-11"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Service Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a service category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="haircut">💇‍♂️ Haircut</SelectItem>
                      <SelectItem value="beard">🧔 Beard Grooming</SelectItem>
                      <SelectItem value="styling">✨ Hair Styling</SelectItem>
                      <SelectItem value="wash">🚿 Hair Wash</SelectItem>
                      <SelectItem value="treatment">🧴 Hair Treatment</SelectItem>
                      <SelectItem value="combo">📦 Combo Package</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Service Description
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe your service in detail. Include what's included, techniques used, and what makes it special..."
                        className="min-h-[120px] resize-none pr-16"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const newValue = handleDescriptionChange(e.target.value)
                          field.onChange(newValue)
                        }}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {characterCount}/{maxCharacters}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your service to help customers understand what they'll receive.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Price and Duration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Service Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <TbCurrencyNaira size={20} className="text-muted-foreground" />
                        </div>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          className="h-11 pl-10"
                          step="0.01"
                          min={0}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the price in Nigerian Naira (₦)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Duration</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Clock size={16} className="text-muted-foreground" />
                        </div>
                        <Input
                          {...field}
                          type="number"
                          placeholder="30"
                          className="h-11 pl-10"
                          min={15}
                          max={300}
                          step={15}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                          min
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Duration in minutes (15-300 minutes, in 15-minute increments)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Active Service Toggle */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Make Service Available
                    </FormLabel>
                    <FormDescription className="text-sm">
                      Enable this service to be visible and available for customer bookings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Toggle service availability"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                className="w-full h-12 text-base font-medium"
                disabled={
                  status === "executing" ||
                  !form.formState.isValid ||
                  !form.formState.isDirty
                }
                type="submit"
              >
                {status === "executing" ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {editMode ? "Updating Service..." : "Creating Service..."}
                  </div>
                ) : (
                  editMode ? "Update Service" : "Create Service"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}