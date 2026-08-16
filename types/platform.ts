import { Platform } from "@/constants/platform"
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