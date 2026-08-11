import { getRoute } from "./route-service";
import { calculateAllPrices, PriceResult } from "./price-calculator";

interface Coordinates {
  lat: number;
  lon: number;
}

export interface TripResult {
  distanceKm: number;
  durationMin: number;
  prices: PriceResult[];
}

export async function getTrip(
  origin: Coordinates,
  dest: Coordinates,
): Promise<TripResult> {
  const route = await getRoute(origin.lat, origin.lon, dest.lat, dest.lon);

  const prices = calculateAllPrices(route);

  return {
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    prices,
  };
}
