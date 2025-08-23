"use client"
import { Session } from "next-auth"
import { Logout } from "@/lib/actions/authgoogle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, TruckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export const UserButton = ({ user: initialUser }: Session) => {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Use the most up-to-date user data from session, fallback to initialUser
  const user = session?.user || initialUser
  
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  if (!user) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Avatar className="w-10 h-10">
          {/* Force re-render by adding key prop with image URL */}
          <AvatarImage 
            key={user.image} 
            src={user.image || ""} 
            alt={user.name || "User"} 
          />
          <AvatarFallback className="bg-primary/25 font-bold">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-6" align="end">
        {/* Profile header */}
        <div className="mb-4 p-4 flex flex-col gap-2 items-center rounded-lg bg-purple-200">
          <Avatar className="w-20 h-20">
            {/* Force re-render by adding key prop with image URL */}
            <AvatarImage 
              key={user.image} 
              src={user.image || ""} 
              alt={user.name || "User"} 
            />
            <AvatarFallback className="text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <p className="font-bold text-sm">{user.name}</p>
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
          className="group py-2 font-medium cursor-pointer"
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