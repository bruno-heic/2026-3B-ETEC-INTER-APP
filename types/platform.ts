import { Platform } from "@/constants/platforms"
import { PredictResult } from "@/services/predict"

export interface SelectedRide {
  platform: Platform
  price: number
  prediction?: PredictResult
  originLat: number
  originLon: number
  originName?: string
  destLat: number
  destLon: number
  destName?: string
}