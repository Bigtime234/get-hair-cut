"use client"
import { ServicesWithImages } from "@/lib/infer-types"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"

export default function ServiceCategory({
  services,
}: {
  services: ServicesWithImages[]
}) {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || services[0]?.category
  
  return services.map((service) => {
    if (service.category === selectedCategory) {
      return (
        <motion.div
          key={service.id}
          animate={{ y: 0, opacity: 1 }}
          initial={{ opacity: 0, y: 6 }}
          className="text-secondary-foreground font-medium"
        >
          {selectedCategory}
        </motion.div>
      )
    }
  })
}