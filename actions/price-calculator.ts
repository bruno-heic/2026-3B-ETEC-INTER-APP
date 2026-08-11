import { platforms, Platform } from "../constants/platform";
import { RouteResult } from "./route-service";

export interface PriceResult {
  platform: Platform;
  price: number;
  isPeak: boolean;
}

function isPeakHour(): boolean {
  const hour = new Date().getHours();
  return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
}

function calculatePrice(
  platform: Platform,
  distanceKm: number,
  durationMin: number,
  peak: boolean,
): number {
  const multiplier = peak ? 1.4 : 1.0;

  const raw =
    platform.base +
    platform.per_km * distanceKm +
    platform.per_min * durationMin;

  return Math.round(raw * multiplier * 100) / 100;
}

export function calculateAllPrices(route: RouteResult): PriceResult[] {
  const peak = isPeakHour();

  return platforms
    .map((platform) => ({
      platform,
      price: calculatePrice(
        platform,
        route.distanceKm,
        route.durationMin,
        peak,
      ),
      isPeak: peak,
    }))
    .sort((a, b) => a.price - b.price);
}
