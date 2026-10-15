import { theme } from "@/constants/theme";
import { editUserInfo } from "@/services/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const toStr = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function EditAccountInfo() {
  const { actionName, userId, userName, userEmail } = useLocalSearchParams<{
    actionName: string;
    userId: string;
    userName: string;
    userEmail: string;
  }>();

  const actions = [
    {
      name: "Nome",
      headerTitle: "Nome da conta",
      mainDescription:
        "Este é o nome pelo qual você será chamado no aplicativo. Você pode alterar quando quiser.",
      value: toStr(userName),
    },
    {
      name: "E-mail",
      headerTitle: "E-mail da conta",
      mainDescription:
        "Este é o e-mail usado para você entrar no aplicativo e receber avisos importantes. Você pode alterar quando quiser.",
      value: toStr(userEmail),
    },
    {
      name: "Senha",
      headerTitle: "Senha da conta",
      mainDescription:
        "Esta é a senha usada para proteger o acesso à sua conta. Escolha uma senha segura e você poderá alterá-la quando quiser.",
      value: "",
    },
  ];

  const action = actions.find((item) => item.name === toStr(actionName));

  const [newInfo, setNewInfo] = useState(action?.value ?? "");

  const sectorMap = {
    Nome: "name",
    "E-mail": "email",
    Senha: "password",
  } as const;

  const handleSave = async () => {
    const sector = sectorMap[action?.name as keyof typeof sectorMap];

    if (sector !== "password" && newInfo.trim() === action?.value) {
      router.back();
      return;
    }

    const result = await editUserInfo(
      sector,
      sector === "name" ? newInfo : "",
      sector === "email" ? newInfo : "",
      sector === "password" ? newInfo : "",
    );

    if (!result.ok) {
      Alert.alert("Erro", result.message);
      return;
    }

    Alert.alert("Pronto", result.message);
    router.back();
  };

  if (!action) return null;

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
          {action.headerTitle}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          style={{
            borderWidth: 1,
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primaryBorder,
            borderRadius: 24,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <MaterialIcons name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: "#1C1C1E",
          paddingVertical: 20,
          paddingHorizontal: 15,
          borderRadius: 32,
          gap: 10,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: theme.fonts.sans,
            fontSize: theme.fontSizes.md,
          }}
        >
          {action.name}
        </Text>
        <TextInput
          value={newInfo}
          onChangeText={setNewInfo}
          secureTextEntry={action.name === "Senha"}
          placeholderTextColor="#9999"
          style={{
            fontSize: theme.fontSizes.md,
            fontFamily: theme.fonts.sans,
            color: theme.colors.text,
            backgroundColor: "#1C1C1E",
            width: 270,
          }}
        />
      </View>

      <Text
        style={{
          color: theme.colors.muted,
          fontSize: theme.fontSizes.md,
          fontFamily: theme.fonts.sans,
        }}
      >
        {action.mainDescription}
      </Text>
    </SafeAreaView>
  );
}
