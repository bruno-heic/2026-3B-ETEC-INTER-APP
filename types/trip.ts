import { Platform } from "@/constants/platforms"
import { PredictResult } from "@/services/predict"

export interface PriceResult {
  platform: Platform
  price: number
  isPeak: boolean
  prediction?: PredictResult
}

export interface TripResult {
  distanceKm: number
  durationMin: number
  prices: PriceResult[]
}