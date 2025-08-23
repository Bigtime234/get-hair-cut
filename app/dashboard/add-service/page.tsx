import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { useForm } from "react-hook-form"
import ServiceForm from "./service-form"

export default async function AddProduct() {
  const session = await auth()
  

  return <ServiceForm/>
}