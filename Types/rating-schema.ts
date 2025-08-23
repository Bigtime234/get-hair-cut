import * as z from "zod"

// Rating Schema
export const RatingSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string().min(1, { message: "Booking ID is required" }),
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  stars: z
    .number()
    .min(1, { message: "Rating must be at least 1 star" })
    .max(5, { message: "Rating cannot exceed 5 stars" }),
})

export type zRatingSchema = z.infer<typeof RatingSchema>