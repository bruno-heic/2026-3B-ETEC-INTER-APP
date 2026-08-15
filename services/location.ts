import * as Location from "expo-location";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Suggestion extends Coordinates {
  displayName: string;
  shortName: string;
}

export async function getLocationWithAddress() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    alert("Permissão de localização negada");
    return null;
  }

  const location = await Location.getCurrentPositionAsync();
  const { latitude, longitude } = location.coords;

  try {
    // Faz a geocodificação reversa para pegar o endereço
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResponse.length > 0) {
      const addr = addressResponse[0];
      const streetName = addr.street
        ? `${addr.street}, ${addr.streetNumber || ""}`
        : addr.name || "Localização atual";
      const district = addr.subregion || addr.district || "";
      const city = addr.city || "";

      const shortName = [streetName, district, city].filter(Boolean).join(", ");
      const displayName = [
        addr.street,
        addr.subregion,
        addr.city,
        addr.region,
        addr.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        lat: latitude,
        lon: longitude,
        shortName: shortName.trim(),
        displayName: displayName || shortName,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar endereço da localização:", error);
  }
  return {
    lat: latitude,
    lon: longitude,
    shortName: "Localização atual",
    displayName: "Localização atual do dispositivo",
  };
}

export async function searchSuggestions(query: string): Promise<Suggestion[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(trimmedQuery)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "pt-BR,pt;q=0.9",
        "User-Agent": "ExpoApp-Search-System",
      },
    });

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data: any[] = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      const displayName = item.display_name ?? "";
      return {
        displayName,
        shortName: displayName
          ? displayName.split(",").slice(0, 3).join(",").trim()
          : "",
        lat: parseFloat(item.lat) || 0,
        lon: parseFloat(item.lon) || 0,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return [];
  }
}

export async function getRoutePolyline(
  origin: Coordinates,
  destination: Coordinates,
) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      return {
        coordinates: data.routes[0].geometry.coordinates,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao calcular rota:", error);
    return null;
  }
}
