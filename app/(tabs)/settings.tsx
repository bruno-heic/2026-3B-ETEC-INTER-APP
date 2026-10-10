import { theme } from "@/constants/theme";
import { signOutUser } from "@/services/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Settings() {
  const { UserId, UserEmail, UserName } = useLocalSearchParams();

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
        paddingHorizontal: 24,
        gap: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          width: "100%",
          height: 48,
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
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 8,
            zIndex: 1,
          }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>

        <Text
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: theme.fonts.sansSemiBold,
            color: theme.colors.text,
            fontSize: theme.fontSizes.md,
            zIndex: 0,
          }}
        >
          Configurações
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 42,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.sansSemiBold,
            color: theme.colors.text,
            fontSize: 32,
            textAlign: "center",
          }}
        >
          {UserName}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.sans,
            color: "#9999",
            fontSize: 22,
            textAlign: "center",
          }}
        >
          {UserEmail}
        </Text>
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
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Nome
          </Text>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSizes.md,
                fontFamily: theme.fonts.sansMedium,
                color: theme.colors.muted,
              }}
            >
              {UserName}
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={theme.colors.muted}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: theme.fontSizes.md,
                fontFamily: theme.fonts.sans,
                color: theme.colors.primary,
              }}
            >
              {UserEmail}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.sans,
                color: "#999",
              }}
            >
              Email principal
            </Text>
          </View>
          <MaterialIcons
            name="arrow-forward-ios"
            size={18}
            color={theme.colors.muted}
          />
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
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sans,
              color: theme.colors.text,
            }}
          >
            Senha
          </Text>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={theme.colors.muted}
            />
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          display: "flex",
          backgroundColor: "#1C1C1E",
          padding: 24,
          borderRadius: 32,
          gap: 24,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSizes.lg,
            fontFamily: theme.fonts.sans,
            color: "#c83232",
            textAlign: "center",
          }}
        >
          Sair da conta
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
