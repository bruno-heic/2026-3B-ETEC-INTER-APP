import { signOutUser } from "@/services/auth";
import { router } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Home() {
  const handleSignOut = async () => {
    const result = await signOutUser();

    if (!result.ok) {
      Alert.alert("Erro", result.message);
      return;
    }

    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace("/(auth)/signIn");
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: "#000",
        flex: 1,
        paddingTop: 32,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          alignItems: "flex-start",
        }}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 60, height: 60, resizeMode: "contain" }}
        />
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={{ color: "#fff" }}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
