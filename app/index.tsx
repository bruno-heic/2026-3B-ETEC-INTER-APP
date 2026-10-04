import { theme } from "@/constants/theme";
import { hasSeenOnboarding } from "@/services/onboarding";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const handleContinue = async () => {
    const session = await supabase.auth.getSession();
    if (session) {
      router.replace("/(tabs)/home");
    }
    const seen = await hasSeenOnboarding();
    router.replace(seen ? "/(auth)/signIn" : "/welcome");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: 80 }}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
}
