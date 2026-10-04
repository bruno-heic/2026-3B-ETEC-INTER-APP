import {
  GoogleSans_400Regular,
  GoogleSans_500Medium,
  GoogleSans_600SemiBold,
} from "@expo-google-fonts/google-sans";
import {
  SpaceMono_400Regular,
  SpaceMono_400Regular_Italic,
  SpaceMono_700Bold,
  SpaceMono_700Bold_Italic,
  useFonts,
} from "@expo-google-fonts/space-mono";

import { Stack } from "expo-router";

export default function Layout() {
  const [loaded] = useFonts({
    SpaceMono: SpaceMono_400Regular,
    "SpaceMono-Bold": SpaceMono_700Bold,
    "SpaceMono-Italic": SpaceMono_400Regular_Italic,
    "SpaceMono-BoldItalic": SpaceMono_700Bold_Italic,

    GoogleSans: GoogleSans_400Regular,
    "GoogleSans-Medium": GoogleSans_500Medium,
    "GoogleSans-SemiBold": GoogleSans_600SemiBold,
  });

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
