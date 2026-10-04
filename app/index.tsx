import { MainButton } from "@/components/button";
import { theme } from "@/constants/theme";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const handleContinue = () => {
    router.navigate("/(setup)/terms");
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 24,
        paddingTop: 48,
      }}
    >
      <View style={{ flex: 1, gap: 20 }}>
        <View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 24,
              fontFamily: theme.fonts.sansSemiBold,
            }}
          >
            Bem-vindo ao Rideless
          </Text>
          <Text
            style={{
              color: theme.colors.muted,
              fontFamily: theme.fonts.sans,
              fontSize: theme.fontSizes.lg,
            }}
          >
            O Rideless permite você a consultar corridas de maneira mais rápida
            e prática.
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 20,
            paddingRight: 48,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 16,
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <Entypo name="price-tag" size={26} color={theme.colors.primary} />
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.md,
                  fontFamily: theme.fonts.sansSemiBold,
                }}
              >
                Estimativa de preços
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontFamily: theme.fonts.sans,
                  fontSize: theme.fontSizes.md,
                }}
              >
                O algoritmo do aplicativo calcula preços a partir de dados como
                endereço, clima, horário e distância, permitindo informações
                precisas com margens de erro quase nulas.
              </Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 16,
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <Ionicons name="apps" size={26} color={theme.colors.primary} />
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.md,
                  fontFamily: theme.fonts.sansSemiBold,
                }}
              >
                Integração com apps
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontFamily: theme.fonts.sans,
                  fontSize: theme.fontSizes.md,
                }}
              >
                O aplicativo, a partir de um clique, redireciona para a Uber ou
                99 com as informações de viagem já preenchidas, facilitando o
                fluxo.
              </Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 16,
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            <FontAwesome name="search" size={26} color={theme.colors.primary} />
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.md,
                  fontFamily: theme.fonts.sansSemiBold,
                }}
              >
                Consultas rápidas
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontFamily: theme.fonts.sans,
                  fontSize: theme.fontSizes.md,
                }}
              >
                Com uma interface limpa e intuitiva, a consulta de corridas é
                facilitada para usuário.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          gap: 12,
        }}
      >
        <MainButton text="Continuar" event={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
