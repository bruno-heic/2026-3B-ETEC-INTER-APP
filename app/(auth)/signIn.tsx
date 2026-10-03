import { MainButton } from "@/components/button";
import { theme } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    alert("Login em desenvolvimento.");
    router.replace("/(tabs)/home");
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
      <View style={{ flex: 1, gap: 20, paddingTop: 36 }}>
        <View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 24,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            Faça login
          </Text>
          <Text
            style={{
              color: theme.colors.muted,
              fontFamily: theme.fonts.sans,
              fontSize: theme.fontSizes.lg,
            }}
          >
            Entre com seu email e senha cadastrados para utilizar os serviços do
            Rideless.
          </Text>
          <View
            style={{
              backgroundColor: "#1C1C1E",
              padding: 24,
              borderRadius: 32,
              marginBlock: 20,
              gap: 24,
            }}
          >
            <TextInput
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#9999"
              value={email}
              onChangeText={setEmail}
              style={{
                fontSize: theme.fontSizes.md,
                fontFamily: theme.fonts.sans,
                color: theme.colors.text,
              }}
            />
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "#353535",
              }}
            />
            <TextInput
              keyboardType="visible-password"
              placeholder="Senha"
              placeholderTextColor="#9999"
              value={password}
              onChangeText={setPassword}
              style={{
                fontSize: theme.fontSizes.md,
                fontFamily: theme.fonts.sans,
                color: theme.colors.text,
              }}
            />
          </View>
          <Link href="/(auth)/signUp">
            <View
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "row",
                gap: 2,
              }}
            >
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={{
                  color: theme.colors.primary,
                  fontFamily: theme.fonts.sansMedium,
                  fontSize: theme.fontSizes.sm,
                }}
              >
                Não possui conta?
              </Text>
            </View>
          </Link>
        </View>
      </View>
      <View>
        <MainButton text="Entrar" event={handleSignIn} />
      </View>
    </SafeAreaView>
  );
}
