import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";

export default function Settings() {
  return (
    <SafeAreaView style={{
        backgroundColor: "#000",
        flex: 1,
        paddingHorizontal: 24,
        gap: 24,
      }}>
      <Text           style={{
            fontFamily: theme.fonts.sansSemiBold,
            color: theme.colors.text,
            fontSize: 34,
          }}>Settings!</Text>
    </SafeAreaView>
  );
}
