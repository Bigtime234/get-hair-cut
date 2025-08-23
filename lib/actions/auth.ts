"use server"
import { signIn,signOut } from '@/server/auth'


export const Login = async () => {
    await signIn("github",{redirectTo: "/"})

}
export const Logout = async () => {
    await signOut({ redirectTo: "/" })

}