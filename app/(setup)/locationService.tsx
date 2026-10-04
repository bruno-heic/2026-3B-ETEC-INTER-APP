import { MainButton } from "@/components/button";
import { SecondaryButton } from "@/components/secondaryButton";
import { theme } from "@/constants/theme";
import { requestLocationPermission } from "@/services/location";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LocationService() {
  const handleContinue = () => {
    router.navigate("/(auth)/signIn");
  };
  const handleGetLocation = async () => {
    try {
      await requestLocationPermission();
      router.navigate("/(auth)/signIn");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 24,
        paddingTop: 12,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          borderWidth: 1,
          backgroundColor: "#0c0c0c",
          borderColor: "#1f1f1f",
          borderRadius: 24,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 8,
        }}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={{ flex: 1, gap: 60, paddingTop: 36 }}>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome6
            name="location-arrow"
            size={56}
            color={theme.colors.primary}
          />
        </View>
        <View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 24,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            Serviço de Localização
          </Text>
          <Text
            style={{
              color: theme.colors.muted,
              fontFamily: theme.fonts.sans,
              fontSize: 20,
            }}
          >
            O serviço de localização permite que você insira seu endereço atual
            nas consultas com apenas um clique.
          </Text>
        </View>
      </View>
      <View
        style={{
          gap: 12,
        }}
      >
        <MainButton
          text="Ativar serviço de localização"
          event={handleGetLocation}
        />
        <SecondaryButton text="Configurar mais tarde" event={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
