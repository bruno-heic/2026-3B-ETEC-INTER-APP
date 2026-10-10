import Options from "@/components/mainOptions";
import { theme } from "@/constants/theme";
import { signOutUser } from "@/services/auth";
import { router } from "expo-router";
import {
  Alert,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{
          backgroundColor: "#000",
          flex: 1,
          paddingTop: 32,
          paddingHorizontal: 24,
          gap: 24,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.sansSemiBold,
            color: theme.colors.text,
            fontSize: 34,
          }}
        >
          Rideless
        </Text>
        <Options />
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={{ color: "#fff" }}>Sair</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
