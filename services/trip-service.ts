import { predictPrice } from "@/services/predict"
import { TripResult } from "@/types/trip"
import { getDirection } from "@/services/directions"
import { calculateAllPrices } from "@/services/price"

interface Coordinates {
  lat: number
  lon: number
}

export async function getTrip(
  origin: Coordinates,
  dest: Coordinates
): Promise<TripResult> {
  // 1. Busca rota via OSRM
  const route = await getDirection(origin.lat, origin.lon, dest.lat, dest.lon)

  // 2. Calcula preços estáticos
  const staticPrices = calculateAllPrices(route)

  // 3. Para cada plataforma, refina o preço com o modelo de ML
  const hora = new Date().getHours()
  const dia_semana = new Date().getDay()

  const prices = await Promise.all(
    staticPrices.map(async (item) => {
      const prediction = await predictPrice({
        distancia_km: route.distanceKm,
        duracao_min: route.durationMin,
        hora,
        dia_semana,
        plataforma: item.platform.app,
        categoria: item.platform.id,
        preco_estimado: item.price,
      })

      return {
        ...item,
        // Se o modelo retornou, usa o predicted_price
        // senão mantém o preço estático como fallback
        price: prediction?.predicted_price ?? item.price,
        prediction,
      }
    })
  )

  // Reordena pelo novo preço após refinamento do modelo
  prices.sort((a, b) => a.price - b.price)

  return {
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    prices,
  }
}