const INTELLIGENCE_URL = "YOUR_INTELLIGENCE_API_URL"

// Resultado do risco de uma área
export interface RiskResult {
  risk_level: "low" | "medium" | "high"
  risk_label: string
  total_crimes_nearby: number
  radius_meters: number
  most_common_crime: string | null
}

// Uma recomendação de localização alternativa
export interface LocationRecommendation {
  type: "location"
  lat: number
  lon: number
  distance_meters: number
  economy: number
  new_price: number
  risk_level: "low" | "medium" | "high"
  risk_label: string
  total_crimes_nearby: number
  most_common_crime: string | null
}

// Uma recomendação de horário
export interface TimeRecommendation {
  type: "time"
  message: string
  economy: number
  hora_sugerida: number
  risk_level: null
}

// Resultado completo do /recommend
export interface RecommendResult {
  current_price: number
  time_recommendation: TimeRecommendation | null
  location_recommendations: LocationRecommendation[]
}

// Chama o endpoint /risk
export async function getRisk(lat: number, lon: number): Promise<RiskResult | null> {
  try {
    const res = await fetch(`${INTELLIGENCE_URL}/risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    })
    if (!res.ok) throw new Error(`Erro: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error("Erro ao chamar /risk:", error)
    return null
  }
}

// Chama o endpoint /recommend
export async function getRecommendations(
  lat: number,
  lon: number,
  destLat: number,
  destLon: number,
  distanciaKm: number,
  duracaoMin: number,
  plataforma: string,
  categoria: string,
  precoEstimado: number,
): Promise<RecommendResult | null> {
  try {
    const hora = new Date().getHours()
    const diaSemana = new Date().getDay()

    const res = await fetch(`${INTELLIGENCE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat,
        lon,
        dest_lat: destLat,
        dest_lon: destLon,
        distancia_km: distanciaKm,
        duracao_min: duracaoMin,
        hora,
        dia_semana: diaSemana,
        plataforma,
        categoria,
        preco_estimado: precoEstimado,
      }),
    })
    if (!res.ok) throw new Error(`Erro: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error("Erro ao chamar /recommend:", error)
    return null
  }
}