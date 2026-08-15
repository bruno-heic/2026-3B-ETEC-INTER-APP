import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../constants/theme";
import SearchInput from "../components/searchInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Suggestion } from "../services/location-actions";
import { MainButton } from "../components/button";
import { Alert } from "react-native";

export default function Search() {
  const { lat, lon, shortName, displayName } = useLocalSearchParams<{
    lat: string;
    lon: string;
    shortName?: string;
    displayName?: string;
  }>();

  const [origin, setOrigin] = useState<Suggestion | null>(null);
  const [destination, setDestination] = useState<Suggestion | null>(null);

  // Limpa/Reseta as informações antigas sempre que os parâmetros da tela mudarem
  useEffect(() => {
    if (lat && lon) {
      setOrigin({
        displayName: displayName || "Localização atual",
        shortName: shortName || "Localização atual",
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });
    } else {
      setOrigin(null);
    }
    setDestination(null);
  }, [lat, lon, shortName, displayName]);

  const handleOriginSelect = (suggestion: Suggestion) => {
    setOrigin(suggestion);
  };

  const handleDestSelect = (suggestion: Suggestion) => {
    setDestination(suggestion);
  };

  const handleConfirmRoute = () => {
    if (!origin) {
      Alert.alert("Atenção", "Por favor, selecione o endereço de embarque.");
      return;
    }

    if (!destination) {
      Alert.alert("Atenção", "Por favor, selecione o endereço de destino.");
      return;
    }

    router.push({
      pathname: "/result",
      params: {
        originLat: String(origin.lat),
        originLon: String(origin.lon),
        originName: origin.shortName,
        destLat: String(destination.lat),
        destLon: String(destination.lon),
        destName: destination.shortName,
      },
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 24,
        justifyContent: "space-between",
        paddingBottom: 20,
      }}
    >
      <SearchInput
        onOriginSelect={handleOriginSelect}
        onDestSelect={handleDestSelect}
        lat={lat}
        lon={lon}
      />

      <MainButton text="Visualizar corrida" event={handleConfirmRoute} />
    </SafeAreaView>
  );
}
