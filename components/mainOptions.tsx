import { theme } from "@/constants/theme";
import { getCompleteUserInfo } from "@/services/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface UserInfo {
  id: string;
  email?: string;
  lastSignIn?: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export default function Options() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const userInfo = await getCompleteUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    }

    loadUserData();
  }, []);

  return (
    <>
      <View
        style={{
          backgroundColor: "#1C1C1E",
          padding: 24,
          borderRadius: 32,
          gap: 24,
        }}
      >
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <MaterialIcons name="shortcut" size={20} color="#9999" />
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Atalhos de rotas
          </Text>
        </TouchableOpacity>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#353535",
          }}
        />
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <MaterialIcons name="history" size={20} color="#9999" />
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Histórico de corridas
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          backgroundColor: "#1C1C1E",
          padding: 24,
          borderRadius: 32,
          gap: 24,
        }}
      >
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: 10,
          }}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/account",
              params: {
                userId: user?.id,
                userEmail: user?.email,
                userName: user?.name,
              },
            })
          }
        >
          <MaterialIcons name="account-circle" size={20} color="#9999" />
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Perfil
          </Text>
        </TouchableOpacity>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#353535",
          }}
        />
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: 10,
          }}
          onPress={() => router.push("/(tabs)/settings")}
        >
          <MaterialIcons name="settings" size={20} color="#9999" />
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Configurações
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
