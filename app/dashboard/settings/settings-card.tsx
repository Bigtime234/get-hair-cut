"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Session } from "next-auth"
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
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { settings } from "@/lib/actions/settings"
import { SettingsSchema } from "@/Types/settings-schema"
import { FormError } from "@/app/auth/form-error"
import { FormSuccess } from "@/app/auth/form-success"
import { useAction } from "next-safe-action/hooks"
import { UploadButton } from "@/app/api/uploadthing/upload"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type SettingsForm = {
  session: Session
}

export default function SettingsCard({ session: initialSession }: SettingsForm) {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { update: updateSession, data: currentSession } = useSession()
  const router = useRouter()

  // Use the most current session data
  const session = currentSession || initialSession

  console.log("🔍 Current session in component:", session)

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: session.user?.name || "",
      image: session.user?.image || "",
    },
  })

  // Update form when session changes
  useEffect(() => {
    if (session.user) {
      console.log("📝 Updating form with session data:", {
        name: session.user.name,
        image: session.user.image
      })
      form.setValue("name", session.user.name || "")
      form.setValue("image", session.user.image || "")
    }
  }, [session.user, form])

  const { execute, status } = useAction(settings, {
    onSuccess: async (data) => {
      console.log("✅ Settings action success:", data)
      
      if (data?.data?.success) {
        setSuccess(data.data.success)
        setError(undefined)
        
        // Get the current form values
        const formName = form.getValues("name")
        const formImage = form.getValues("image")
        
        console.log("🔄 About to update session with:", {
          name: formName,
          image: formImage
        })
        
        // Force session update with the new data
        try {
          const updateResult = await updateSession({
            user: {
              name: formName,
              image: formImage,
            }
          })
          
          console.log("✅ Session update result:", updateResult)
        } catch (e) {
          console.log("❌ Session update error:", e)
        }
        
        // Small delay to ensure session update processes
        setTimeout(() => {
          console.log("🔄 Refreshing router...")
          router.refresh()
        }, 500)
      }
      if (data?.data?.error) {
        setError(data.data.error)
        setSuccess(undefined)
      }
    },
    onError: (error) => {
      console.error("❌ Settings action error:", error)
      setError("Something went wrong")
      setSuccess(undefined)
    },
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    console.log("📤 Submitting form with values:", values)
    setError(undefined)
    setSuccess(undefined)
    execute(values)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Settings</CardTitle>
        <CardDescription>Update your account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Debug info */}
            <div className="p-4 bg-gray-100 rounded text-xs">
              <p><strong>Current Session Image:</strong> {session.user?.image || "None"}</p>
              <p><strong>Form Image Value:</strong> {form.watch("image") || "None"}</p>
              <p><strong>Avatar Uploading:</strong> {avatarUploading ? "TRUE" : "FALSE"}</p>
              <p><strong>Status:</strong> {status}</p>
              {avatarUploading && (
                <button 
                  type="button"
                  onClick={() => {
                    setAvatarUploading(false)
                    console.log("🔄 Manually reset avatarUploading state")
                  }}
                  className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  Reset Upload State
                </button>
              )}
            </div>

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

            {/* Image Field (shadcn Avatar + UploadThing button) */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => {
                const hasImage = !!field.value
                const initial = session.user?.name?.charAt(0).toUpperCase() || "U"

                console.log("🖼️ Avatar field render:", {
                  fieldValue: field.value,
                  hasImage,
                  initial
                })

                return (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>

                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-20 h-20">
                        {/* Force re-render with key prop */}
                        <AvatarImage 
                          key={field.value || "no-image"} 
                          src={field.value || ""} 
                          alt="User Image"
                          onLoad={() => console.log("🖼️ Avatar image loaded:", field.value)}
                          onError={(e) => console.log("❌ Avatar image failed to load:", field.value, e)}
                        />
                        <AvatarFallback className="font-bold">
                          {initial}
                        </AvatarFallback>
                      </Avatar>

                      <div className="upload-button-wrapper">
                        <UploadButton
                          endpoint="avatarUploader"
                          onUploadBegin={() => {
                            console.log("📤 Upload started...")
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
                          onClientUploadComplete={(res) => {
                            console.log("✅ Upload complete:", res[0].url)
                            // Update the controlled field so Avatar re-renders immediately
                            field.onChange(res[0].url!)
                            
                            // Force reset uploading state
                            setAvatarUploading(false)
                            
                            // Clear any previous messages
                            setError(undefined)
                            setSuccess("Avatar uploaded! Don't forget to save your changes.")
                            
                            console.log("🔄 Upload state reset, avatarUploading should be false")
                          }}
                          content={{
                            button({ ready }) {
                              if (avatarUploading) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                                    <span>Uploading...</span>
                                  </div>
                                )
                              }
                              return ready
                                ? (hasImage ? "Change Avatar" : "Upload Avatar")
                                : "Getting Ready..."
                            },
                          }}
                          appearance={{
                            button:
                              "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium border-none cursor-pointer transition-colors duration-200",
                            allowedContent: "text-gray-500 text-xs mt-1",
                          }}
                        />
                      </div>
                    </div>

                    {/* keep the RHF field registered */}
                    <FormControl>
                      <Input
                        type="hidden"
                        disabled={status === "executing"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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