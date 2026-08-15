const API_URL = "https://didactic-engine-4q7gw47rw7x6cq556-8000.app.github.dev"

export interface PredictInput {
  distancia_km: number
  duracao_min: number
  hora: number
  dia_semana: number
  plataforma: string
  categoria: string
  preco_estimado: number
  cenario?: string
  demanda?: number
  motoristas?: number
  multiplicador_regiao?: number
  multiplicador_hora?: number
  multiplicador_demanda?: number
  prob_aceitacao?: number
}

export interface PredictResult {
  predicted_price: number
  price_min: number
  price_max: number
  acceptance_probability: number
  demand_multiplier: number
  confidence: number
}

export async function predictPrice(input: PredictInput): Promise<PredictResult | null> {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        // Valores padrão para campos opcionais
        cenario: input.cenario ?? "demanda_normal",
        demanda: input.demanda ?? 80,
        motoristas: input.motoristas ?? 70,
        multiplicador_regiao: input.multiplicador_regiao ?? 1.0,
        multiplicador_hora: input.multiplicador_hora ?? 1.0,
        multiplicador_demanda: input.multiplicador_demanda ?? 1.0,
        prob_aceitacao: input.prob_aceitacao ?? 0.85,
        preco_real: 0,
        origem_lat: 0,
        origem_lon: 0,
        destino_lat: 0,
        destino_lon: 0,
      }),
    })

    if (!res.ok) throw new Error(`Erro: ${res.status}`)

    return await res.json()
  } catch (error) {
    console.error("Erro ao chamar /predict:", error)
    return null
  }
}