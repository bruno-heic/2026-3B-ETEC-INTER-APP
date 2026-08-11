import {
  useFonts,
  SpaceMono_400Regular,
  SpaceMono_400Regular_Italic,
  SpaceMono_700Bold,
  SpaceMono_700Bold_Italic,
} from "@expo-google-fonts/space-mono";
import { Stack } from "expo-router";

export default function Layout() {
  const [loaded] = useFonts({
    SpaceMono: SpaceMono_400Regular,
    "SpaceMono-Bold": SpaceMono_700Bold,
    "SpaceMono-Italic": SpaceMono_400Regular_Italic,
    "SpaceMono-BoldItalic": SpaceMono_700Bold_Italic,
  });

  if (!loaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
