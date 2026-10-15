import SearchInput from "@/components/searchInput";
import { theme } from "@/constants/theme";
import { Suggestion } from "@/services/location";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Search() {
  const { lat, lon, shortName, displayName } = useLocalSearchParams<{
    lat: string;
    lon: string;
    shortName?: string;
    displayName?: string;
  }>();

  const [origin, setOrigin] = useState<Suggestion | null>(null);
  const [destination, setDestination] = useState<Suggestion | null>(null);

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
        backgroundColor: "#000",
        flex: 1,
        paddingHorizontal: 24,
        gap: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          width: "100%",
          height: 48,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={{
            borderWidth: 1,
            backgroundColor: "#0c0c0c",
            borderColor: "#1f1f1f",
            borderRadius: 24,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 8,
            zIndex: 1,
          }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>

        <Text
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: theme.fonts.sansSemiBold,
            color: theme.colors.text,
            fontSize: theme.fontSizes.md,
            zIndex: 0,
          }}
        >
          Corrida
        </Text>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primaryBorder,
            borderRadius: 24,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
          onPress={handleConfirmRoute}
        >
          <MaterialIcons name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <SearchInput
        onOriginSelect={handleOriginSelect}
        onDestSelect={handleDestSelect}
        lat={lat}
        lon={lon}
      />
    </SafeAreaView>
  );
}
