"use client"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { ServicesWithImages } from "@/lib/infer-types"

type ServiceTagsProps = {
  services: ServicesWithImages[]
}

export default function ServiceTags({ services }: ServiceTagsProps) {
  const router = useRouter()
  const params = useSearchParams()
  const category = params.get("category")
  
  // Get unique categories from services
  const categories = Array.from(new Set(services.map(service => service.category).filter(Boolean)))
  
  const setFilter = (category: string) => {
    if (category) {
      router.push(`?category=${category}`)
    } else {
      router.push("/")
    }
  }
  
  return (
    <div className="my-4 flex gap-4 items-center justify-center flex-wrap">
      <Badge
        onClick={() => setFilter("")}
        className={cn(
          "cursor-pointer bg-black hover:bg-black/75 hover:opacity-100",
          !category ? "opacity-100" : "opacity-50"
        )}
      >
        All
      </Badge>
      {categories.map((cat) => (
        <Badge
          key={cat}
          onClick={() => setFilter(cat!)}
          className={cn(
            "cursor-pointer bg-blue-500 hover:bg-blue-600 hover:opacity-100 capitalize",
            category === cat ? "opacity-100" : "opacity-50"
          )}
        >
          {cat}
        </Badge>
      ))}
    </div>
  )
}