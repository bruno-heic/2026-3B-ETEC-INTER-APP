import { MainButton } from "@/components/button";
import { theme } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Terms() {
  const handleContinue = () => {
    router.push("/(setup)/locationService");
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
            }}
          >
            Termos de uso e Política de Privacidade
          </Text>
        </View>
        <ScrollView
          style={{
            backgroundColor: "#1C1C1E",
            padding: 28,
            borderRadius: 32,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 8,
            }}
          >
            Última atualização: 03 de outubro de 2026
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 8,
            }}
          >
            Ao utilizar este aplicativo, você concorda com a coleta e uso de
            dados descritos abaixo.
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            1. DADOS QUE COLETAMOS
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            a) Dados da Conta:
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.sans,
                marginBottom: 8,
              }}
            >
              {" "}
              Nome, e-mail, número de telefone e foto, necessários para criação
              da conta, login e segurança.
            </Text>
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            b) Dados de Localização:
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.sans,
                marginBottom: 8,
              }}
            >
              {" "}
              Coletamos sua localização aproximada e localização precisa (GPS),
              mesmo em segundo plano quando autorizado, para calcular a origem,
              o destino, comparar preços de corridas em tempo real nas
              plataformas parceiras e exibir ofertas mais vantajosas na sua
              região.
            </Text>
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            c) Dados de Desempenho e Uso:
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.sans,
                marginBottom: 8,
              }}
            >
              {" "}
              Coletamos dados de desempenho do app, como relatórios de falhas,
              tempo de resposta, interações, cliques e diagnósticos, para
              garantir a estabilidade e melhorar a experiência.
            </Text>
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            d) Identificadores e Tags:
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.sans,
                marginBottom: 8,
              }}
            >
              {" "}
              Utilizamos identificadores do dispositivo, ID de publicidade e
              tags de análise para personalização de ofertas, medição de
              desempenho e prevenção a fraudes.
            </Text>
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            2. COMO USAMOS
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 8,
            }}
          >
            Usamos seus dados exclusivamente para: autenticar sua conta,
            fornecer a comparação de preços, melhorar o desempenho do app,
            enviar alertas de preços e cumprir obrigações legais.
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            2. COMO USAMOS
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 8,
            }}
          >
            Usamos seus dados exclusivamente para: autenticar sua conta,
            fornecer a comparação de preços, melhorar o desempenho do app,
            enviar alertas de preços e cumprir obrigações legais.
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
              fontFamily: theme.fonts.sansSemiBold,
              marginBottom: 8,
            }}
          >
            4. SEUS DIREITOS
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 16,
            }}
          >
            Você pode solicitar a exclusão da sua conta e dos seus dados a
            qualquer momento em: Configurações, Excluir Conta ou pelo e-mail de
            suporte.
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontFamily: theme.fonts.sans,
              marginBottom: 32,
            }}
          >
            Ao continuar, você declara que leu e aceita estes Termos de Uso e
            Política de Privacidade.
          </Text>
        </ScrollView>
      </View>
      <View
        style={{
          gap: 20,
        }}
      >
        <MainButton text="Aceitar e fechar" event={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
