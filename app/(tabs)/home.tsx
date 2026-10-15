import Options from "@/components/mainOptions";
import { theme } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
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
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: "#1C1C1E",
            paddingBlock: 20,
            paddingInline: 15,
            borderRadius: 32,
            gap: 10,
          }}
          onPress={() => router.push("/search")}
        >
          <FontAwesome name="search" size={20} color="#9999" />
          <TextInput
            placeholder="Consultar uma viagem"
            placeholderTextColor="#9999"
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
              backgroundColor: "#1C1C1E",
              width: 270,
            }}
          />
        </TouchableOpacity>
        <Options />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
