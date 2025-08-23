"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Session } from "next-auth";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod"; 
import { z } from "zod"; 
import { settings } from "@/lib/actions/settings";
import { SettingsSchema } from "@/Types/settings-schema";
import Image from "next/image"; 
import { FormError } from "@/app/auth/form-error"
import { FormSuccess } from "@/app/auth/form-success"
import { useAction } from "next-safe-action/hooks"
import { UploadButton } from "@/app/api/uploadthing/upload";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SettingsForm = {
  session: Session
}

export default function SettingsCard({ session }: SettingsForm) {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [avatarUploading, setAvatarUploading] = useState(false)
  // Add local image state to force UI updates
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null)
  // Add image loading state
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  
  const { data: clientSession, update: updateSession } = useSession()
  const router = useRouter()
  
  const currentSession = clientSession || session

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: currentSession.user?.name || "",
      image: currentSession.user?.image || "",
    },
  })

  useEffect(() => {
    if (currentSession?.user) {
      form.setValue("name", currentSession.user.name || "")
      form.setValue("image", currentSession.user.image || "")
      // Update local image state when session changes
      setLocalImageUrl(currentSession.user.image || null)
      // Reset error state when session changes
      setImageError(false)
    }
  }, [currentSession?.user?.name, currentSession?.user?.image, form])

  // Use local image URL if available, otherwise fall back to form value
  const currentImageUrl = localImageUrl || form.watch("image")

  const { execute, status } = useAction(settings, {
    onSuccess: async (data) => {
      if (data?.data?.success) {
        setSuccess(data.data.success)
        setError(undefined)
        
        console.log("🚀 Settings updated, triggering session update...")
        
        // Update session with specific data to trigger JWT callback
        await updateSession({
          image: form.getValues("image"),
          name: form.getValues("name")
        })
        
        // Refresh the router to get updated server-side session
        router.refresh()
        
        console.log("✅ Session updated and page refreshed")
      }
      if (data?.data?.error) {
        setError(data.data.error)
        setSuccess(undefined)
      }
    },
    onError: (error) => {
      console.error("Action error:", error)
      setError("Something went wrong")
      setSuccess(undefined)
    },
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    console.log("📤 Submitting values:", values)
    setError(undefined)
    setSuccess(undefined)
    execute(values)
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  useEffect(() => {
    console.log("🔍 Current image URL:", currentImageUrl)
    console.log("🔍 Local image URL:", localImageUrl)
    console.log("🔍 Current session:", currentSession)
  }, [currentImageUrl, localImageUrl, currentSession])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Settings</CardTitle>
        <CardDescription>Update your account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={status === "executing"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Field */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <div className="flex items-center gap-4 mb-4">
                    {currentImageUrl && !imageError ? (
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                          )}
                          <img
                            src={currentImageUrl}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                            alt="User Avatar"
                            onLoad={() => {
                              console.log("✅ Image loaded successfully:", currentImageUrl)
                              setImageLoading(false)
                              setImageError(false)
                            }}
                            onError={(e) => {
                              console.error("❌ Image failed to load:", currentImageUrl)
                              console.error("Error event:", e)
                              
                              setImageLoading(false)
                              setImageError(true)
                              
                              // Test if URL is accessible
                              console.log("🔍 Testing URL accessibility...")
                              fetch(currentImageUrl, { method: 'HEAD', mode: 'no-cors' })
                                .then(() => {
                                  console.log("✅ URL is accessible via fetch")
                                })
                                .catch(err => {
                                  console.error("❌ URL fetch failed:", err)
                                })
                            }}
                            style={{ 
                              width: '80px', 
                              height: '80px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div className="upload-button-wrapper">
                          <UploadButton
                            endpoint="avatarUploader"
                            onUploadBegin={() => {
                              console.log("📤 Upload started")
                              setAvatarUploading(true)
                            }}
                            onUploadError={(error) => {
                              console.error("❌ Upload error:", error)
                              form.setError("image", {
                                type: "validate",
                                message: error.message,
                              })
                              setAvatarUploading(false)
                            }}
                            onClientUploadComplete={async (res) => {
                              console.log("✅ Upload complete:", res)
                              if (res && res[0] && res[0].url) {
                                const newImageUrl = res[0].url
                                console.log("🔄 New image URL:", newImageUrl)
                                
                                // Wait a moment for UploadThing to process
                                await new Promise(resolve => setTimeout(resolve, 1000))
                                
                                // Immediately update local state for UI
                                setLocalImageUrl(newImageUrl)
                                setImageError(false)
                                form.setValue("image", newImageUrl, { shouldDirty: true })
                                
                                // Auto-submit with the new image
                                const formData = {
                                  name: form.getValues("name"),
                                  image: newImageUrl
                                }
                                console.log("🚀 Auto-submitting:", formData)
                                execute(formData)
                              }
                              setAvatarUploading(false)
                            }}
                            content={{
                              button({ ready }) {
                                if (avatarUploading) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                      <span>Uploading...</span>
                                    </div>
                                  )
                                }
                                return ready ? "Change Avatar" : "Getting Ready..."
                              },
                            }}
                            appearance={{
                              button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium border-none cursor-pointer transition-colors duration-200",
                              allowedContent: "text-gray-500 text-xs mt-1"
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                          {getUserInitials(currentSession.user?.name)}
                        </div>
                        <div className="upload-button-wrapper">
                          <UploadButton
                            endpoint="avatarUploader"
                            onUploadBegin={() => {
                              console.log("📤 Upload started")
                              setAvatarUploading(true)
                            }}
                            onUploadError={(error) => {
                              console.error("❌ Upload error:", error)
                              form.setError("image", {
                                type: "validate",
                                message: error.message,
                              })
                              setAvatarUploading(false)
                            }}
                            onClientUploadComplete={async (res) => {
                              console.log("✅ Upload complete:", res)
                              if (res && res[0] && res[0].url) {
                                const newImageUrl = res[0].url
                                
                                // Immediately update local state for UI
                                setLocalImageUrl(newImageUrl)
                                form.setValue("image", newImageUrl, { shouldDirty: true })
                                console.log("🔄 New image URL set:", newImageUrl)
                                
                                // Auto-submit with the new image
                                const formData = {
                                  name: form.getValues("name"),
                                  image: newImageUrl
                                }
                                console.log("🚀 Auto-submitting:", formData)
                                execute(formData)
                              }
                              setAvatarUploading(false)
                            }}
                            content={{
                              button({ ready }) {
                                if (avatarUploading) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                      <span>Uploading...</span>
                                    </div>
                                  )
                                }
                                return ready ? "Upload Avatar" : "Getting Ready..."
                              },
                            }}
                            appearance={{
                              button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium border-none cursor-pointer transition-colors duration-200",
                              allowedContent: "text-gray-500 text-xs mt-1"
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 space-y-1 p-2 border rounded">
                      <div>Local Image: {localImageUrl || 'none'}</div>
                      <div>Form Image: {form.watch("image") || 'none'}</div>
                      <div>Session Image: {currentSession.user?.image || 'none'}</div>
                      <div>Image Error: {imageError ? 'Yes' : 'No'}</div>
                      <div>Image Loading: {imageLoading ? 'Yes' : 'No'}</div>
                      {currentImageUrl && (
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              console.log("🧪 Testing image URL:", currentImageUrl)
                              window.open(currentImageUrl, '_blank')
                            }}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                          >
                            Test URL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              console.log("🔄 Forcing image refresh...")
                              setImageError(false)
                              setLocalImageUrl(currentImageUrl)
                            }}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <FormControl>
                    <Input
                      type="hidden"
                      disabled={status === "executing"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error and Success Messages */}
            {error && <FormError message={error} />}
            {success && <FormSuccess message={success} />}

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <Button
                type="submit"
                disabled={status === "executing" || avatarUploading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {status === "executing" ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}