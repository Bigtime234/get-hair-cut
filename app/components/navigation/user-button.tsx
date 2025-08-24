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
import { LogOut, Settings, Calendar, User, Crown } from "lucide-react"
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
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="relative group">
          <Avatar className="w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700 transition-all duration-300 group-hover:ring-amber-400 group-hover:shadow-lg">
            <AvatarImage
              key={user.image}
              src={user.image || ""}
              alt={user.name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-lg shadow-inner">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0 shadow-2xl border-0 bg-white dark:bg-slate-900" align="end">
        {/* Elegant header with gradient background */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-6 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-3 ring-white/20 shadow-xl">
              <AvatarImage
                key={user.image}
                src={user.image || ""}
                alt={user.name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-xl">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                <Crown size={16} className="text-amber-400 flex-shrink-0" />
              </div>
              <p className="text-slate-300 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-400 text-xs font-medium">Active Member</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2">
          {/* Profile section */}
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/profile")}
            className="group py-3 px-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors duration-200">
                <User size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Profile</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your account</p>
              </div>
            </div>
          </DropdownMenuItem>

          {/* My Appointments */}
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/appointments")}
            className="group py-3 px-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
                <Calendar size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">My Appointments</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">View booking history</p>
              </div>
            </div>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="group py-3 px-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors duration-200">
                <Settings size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform duration-200 group-hover:rotate-90" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Settings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Preferences & privacy</p>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          {/* Sign out */}
          <DropdownMenuItem
            onClick={() => Logout()}
            className="group py-3 px-4 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors duration-200">
                <LogOut size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400">Sign Out</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-red-500">End your session</p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}