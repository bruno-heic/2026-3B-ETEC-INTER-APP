import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
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
      </View>
    </SafeAreaView>
  );
}
