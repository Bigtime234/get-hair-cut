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
import { User, Camera, Scissors } from "lucide-react"

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
      form.setValue("name", session.user.name || "")
      form.setValue("image", session.user.image || "")
    }
  }, [session.user, form])

  const { execute, status } = useAction(settings, {
    onSuccess: async (data) => {
      if (data?.data?.success) {
        setSuccess(data.data.success)
        setError(undefined)
        
        // Get the current form values
        const formName = form.getValues("name")
        const formImage = form.getValues("image")
        
        // Force session update with the new data
        try {
          await updateSession({
            user: {
              name: formName,
              image: formImage,
            }
          })
        } catch (e) {
          console.log("Session update error:", e)
        }
        
        // Small delay to ensure session update processes
        setTimeout(() => {
          router.refresh()
        }, 500)
      }
      if (data?.data?.error) {
        setError(data.data.error)
        setSuccess(undefined)
      }
    },
    onError: (error) => {
      setError("Something went wrong")
      setSuccess(undefined)
    },
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    setError(undefined)
    setSuccess(undefined)
    execute(values)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white relative">
          <div className="absolute top-4 right-4">
            <Scissors className="h-8 w-8 text-amber-200" />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <User className="h-6 w-6" />
            Profile Settings
          </CardTitle>
          <CardDescription className="text-amber-100">
            Update your barber profile information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Avatar Section */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const hasImage = !!field.value
                  const initial = session.user?.name?.charAt(0).toUpperCase() || "B"

                  return (
                    <FormItem className="text-center">
                      <FormLabel className="text-slate-700 font-semibold text-lg">
                        Profile Photo
                      </FormLabel>
                      
                      <div className="flex flex-col items-center gap-6">
                        {/* Avatar Display */}
                        <div className="relative group">
                          <Avatar className="w-32 h-32 ring-4 ring-amber-100 shadow-xl transition-all duration-300 group-hover:ring-amber-200">
                            <AvatarImage 
                              key={field.value || "no-image"} 
                              src={field.value || ""} 
                              alt="Profile Photo"
                              className="object-cover"
                            />
                            <AvatarFallback className="font-bold text-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        {/* Upload Button */}
                        <div className="w-full max-w-xs">
                          <UploadButton
                            endpoint="avatarUploader"
                            onUploadBegin={() => {
                              setAvatarUploading(true)
                            }}
                            onUploadError={(error) => {
                              form.setError("image", {
                                type: "validate",
                                message: error.message,
                              })
                              setAvatarUploading(false)
                            }}
                            onClientUploadComplete={(res) => {
                              field.onChange(res[0].url!)
                              setAvatarUploading(false)
                              setError(undefined)
                              setSuccess("Photo uploaded successfully! Don't forget to save changes.")
                            }}
                            content={{
                              button({ ready }) {
                                if (avatarUploading) {
                                  return (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                      <span>Uploading...</span>
                                    </div>
                                  )
                                }
                                return ready
                                  ? (hasImage ? "Change Photo" : "Upload Photo")
                                  : "Getting Ready..."
                              },
                            }}
                            appearance={{
                              button: `w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                avatarUploading 
                                  ? "bg-amber-400 cursor-not-allowed" 
                                  : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              } text-white border-none`,
                              allowedContent: "text-slate-500 text-xs mt-2 text-center",
                            }}
                          />
                        </div>
                      </div>

                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-lg">
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        disabled={status === "executing" || avatarUploading}
                        className="h-12 text-lg border-2 border-slate-200 focus:border-amber-500 focus:ring-amber-200 rounded-xl transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error and Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <FormError message={error} />
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <FormSuccess message={success} />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={status === "executing" || avatarUploading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {status === "executing" ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Saving Changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <User className="h-5 w-5" />
                      <span>Save Profile</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}