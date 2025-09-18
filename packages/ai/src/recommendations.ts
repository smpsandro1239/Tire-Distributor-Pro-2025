export interface TireRecommendation {
  tireId: string
  score: number
  reason: string
}

export function recommendTires(params: {
  vehicleType: string
  season: string
  budget: number
  usage: string
}): TireRecommendation[] {
  // Simplified recommendation logic
  // In production, this would use ML models
  return [
    {
      tireId: 'tire-1',
      score: 0.95,
      reason: 'Perfect match for your vehicle and usage pattern'
    }
  ]
}
