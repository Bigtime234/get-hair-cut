import { db } from "@/server"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import placeholder from "@/public/Barber2.jpg"

export default async function Services() {
  const services = await db.query.services.findMany({
    orderBy: (services, { desc }) => [desc(services.createdAt)],
    // Include gallery data if you have it in your schema
    with: {
      // Add any relations you might have for images/gallery
    }
  })
 
  if (!services) throw new Error("No services found")
 
  const dataTable = services.map((service) => {
    // Convert price from decimal string to number for display
    const price = typeof service.price === 'string' ? parseFloat(service.price) : Number(service.price)
   
    // Check if service has a valid image URL, otherwise use placeholder
    const hasValidImage = service.imageUrl && 
      service.imageUrl !== "" && 
      !service.imageUrl.includes("placeholder") &&
      !service.imageUrl.includes("Barber2.jpg")
    
    const image = hasValidImage ? service.imageUrl as string : placeholder.src
   
    // Convert rating from decimal string to number, default to 0
    const averageRating = service.averageRating
      ? (typeof service.averageRating === 'string' ? parseFloat(service.averageRating) : Number(service.averageRating))
      : 0
   
    return {
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: price,
      duration: service.duration,
      category: service.category || 'general',
      image: image || "",
      averageRating: averageRating,
      totalRatings: service.totalRatings || 0,
      isActive: service.isActive,
      // Pass the original service data for the ServiceGallery component
      serviceData: service,
    }
  })
 
  if (!dataTable.length) {
    return (
      <div>
        <DataTable columns={columns} data={[]} />
      </div>
    )
  }
 
  return (
    <div>
      <DataTable columns={columns} data={dataTable} />
    </div>
  )
}