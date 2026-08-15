import { Text, View, TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getLocationWithAddress } from "../services/location";
import { MainButton } from "../components/button";
export default function Index() {
  const handleLocation = async () => {
    const coords = await getLocationWithAddress();

    if (!coords) return;

    router.replace({
      pathname: "/search",
      params: {
        lat: String(coords.lat),
        lon: String(coords.lon),
      },
    });
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 30,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          paddingBottom: 120,
        }}
      >
        <MaterialIcons name="near-me" size={40} color={theme.colors.text} />
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            color: theme.colors.text,
            fontSize: theme.fontSizes.xl,
            textAlign: "center",
            lineHeight: 28,
          }}
        >
          O Rideless quer usar sua localização para comparar preços de corrida
          em tempo real.
        </Text>
      </View>

      <View
        style={{
          gap: 20,
          width: "100%",
          paddingBottom: 40,
        }}
      >
        <MainButton text="Usar localização atual" event={handleLocation} />

        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/search",
              params: {
                lat: "-23.5615",
                lon: "-46.6559",
              },
            })
          }
        >
          <Text
            style={{
              color: theme.colors.muted,
              fontSize: theme.fontSizes.lg,
              textAlign: "center",
              fontFamily: theme.fonts.mono,
            }}
          >
            Procurar manualmente
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
