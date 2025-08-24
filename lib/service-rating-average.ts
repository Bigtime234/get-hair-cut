// NEW FILE: lib/service-rating-average.ts
// CREATE THIS FILE: lib/service-rating-average.ts
// Helper function for calculating service rating averages (like your format-price utility)

export function getServiceRatingAverage(ratings: number[]): number {
  if (ratings.length === 0) return 0
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export function calculateRatingDistribution(ratings: number[]) {
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution]++
    }
  })

  return distribution
}

export function getRatingPercentages(ratings: number[]) {
  if (ratings.length === 0) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }

  const distribution = calculateRatingDistribution(ratings)
  const total = ratings.length

  return {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100),
  }
}