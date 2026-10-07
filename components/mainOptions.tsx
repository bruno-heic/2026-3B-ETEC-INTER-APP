import { theme } from "@/constants/theme";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
export default function Options() {
  return (
    <>
      <View
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
      >
        <FontAwesome name="search" size={20} color="#9999" />
        <TextInput
          placeholder="Consultar uma corrida"
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
