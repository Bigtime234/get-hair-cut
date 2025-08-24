// NEW FILE: app/components/services/service-ratings.tsx
// CREATE THIS FILE: app/components/services/service-ratings.tsx
// Service ratings display component (replaces Reviews)

"use client"

import { useEffect, useState } from "react"
import { Star, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getServiceRatings } from "@/lib/actions/get-service-ratings"
import { RatingWithDetails } from "@/lib/infer-types"

type ServiceRatingsProps = {
  serviceId: string
}

export default function ServiceRatings({ serviceId }: ServiceRatingsProps) {
  const [ratings, setRatings] = useState<RatingWithDetails[]>([])
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRatings() {
      try {
        const data = await getServiceRatings(serviceId)
        if (data.success) {
          setRatings(data.success.ratings)
          setRatingStats(data.success.stats)
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [serviceId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Customer Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (ratingStats.totalRatings === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Customer Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No ratings yet</p>
            <p className="text-slate-400">Be the first to rate this service!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ratingData = [
    { stars: 5, count: ratingStats.fiveStars, percentage: (ratingStats.fiveStars / ratingStats.totalRatings) * 100 },
    { stars: 4, count: ratingStats.fourStars, percentage: (ratingStats.fourStars / ratingStats.totalRatings) * 100 },
    { stars: 3, count: ratingStats.threeStars, percentage: (ratingStats.threeStars / ratingStats.totalRatings) * 100 },
    { stars: 2, count: ratingStats.twoStars, percentage: (ratingStats.twoStars / ratingStats.totalRatings) * 100 },
    { stars: 1, count: ratingStats.oneStar, percentage: (ratingStats.oneStar / ratingStats.totalRatings) * 100 },
  ]

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Customer Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-600 mb-2">
                  {ratingStats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(ratingStats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-slate-600">
                  Based on {ratingStats.totalRatings} rating{ratingStats.totalRatings !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {ratingData.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{item.stars}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={item.percentage} 
                      className="h-2" 
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {rating.customer.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rating.stars
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {rating.stars} star{rating.stars !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      <p>Service: <span className="font-medium">{rating.booking.service.name}</span></p>
                      <p>Appointment: {new Date(rating.booking.appointmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {ratings.length > 5 && (
              <div className="text-center mt-4">
                <Badge variant="outline" className="text-sm">
                  +{ratings.length - 5} more ratings
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}