"use client"
import { Session } from "next-auth"
import { Logout } from "@/lib/actions/authgoogle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { useEffect, useState } from "react"
import { LogOut, Settings, TruckIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export const UserButton = ({ user: initialUser }: Session) => {
  const router = useRouter()
  
  // Use session hook to get fresh session data
  const { data: session, status } = useSession()
  
  // Use the most current user data available
  const user = session?.user || initialUser
  
  // Force re-render when session changes
  const [imageKey, setImageKey] = useState(0)
  
  useEffect(() => {
    if (session?.user?.image !== initialUser?.image) {
      setImageKey(prev => prev + 1)
    }
  }, [session?.user?.image, initialUser?.image])

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }
 
  if (user) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar className="w-10 h-10">
            {user.image ? (
              <Image 
                key={`avatar-trigger-${imageKey}`} // Force re-render
                src={user.image} 
                alt={user.name!} 
                fill={true}
                className="object-cover rounded-full"
                unoptimized
              />
            ) : (
              <AvatarFallback className="bg-primary/25">
                <div className="font-bold">
                  {getUserInitials(user.name)}
                </div>
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-6" align="end">
          <div className="mb-4 p-4 flex flex-col gap-1 items-center rounded-lg bg-purple-200">
            {user.image ? (
              <Image
                key={`avatar-dropdown-${imageKey}`} // Force re-render
                src={user.image}
                alt={user.name!}
                className="rounded-3xl object-cover"
                width={80}
                height={80}
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl">
                {getUserInitials(user.name)}
              </div>
            )}
            <p className="font-bold text-xs">{user.name}</p>
            <span className="text-xs font-medium text-secondary-foreground">
              {user.email}
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/orders")}
            className="group py-2 font-medium cursor-pointer"
          >
            <TruckIcon
              size={14}
              className="mr-3 group-hover:translate-x-1 transition-all duration-300 ease-in-out"
            />
            My orders
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="group py-2 font-medium cursor-pointer ease-in-out"
          >
            <Settings
              size={14}
              className="mr-3 group-hover:rotate-180 transition-all duration-300 ease-in-out"
            />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => Logout()}
            className="py-2 group focus:bg-destructive/30 font-medium cursor-pointer"
          >
            <LogOut
              size={14}
              className="mr-3 group-hover:scale-75 transition-all duration-300 ease-in-out"
            />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return null
}