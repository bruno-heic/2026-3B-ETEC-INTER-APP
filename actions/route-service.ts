export interface RouteResult {
  distanceKm: number;
  durationMin: number;
}

export async function getRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;

  const res = await fetch(url);

  if (!res.ok) throw new Error(`Erro OSRM: ${res.status}`);

  const data = await res.json();

  if (data.code !== "Ok" || !data.routes.length) {
    throw new Error("Rota não encontrada");
  }

  const route = data.routes[0];

  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}
