import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

export default function Confirm() {
  const {
    platformName,
    platformApp,
    productId,
    price,
    priceMin,
    priceMax,
    confidence,
    acceptanceProbability,
    originLat,
    originLon,
    originName,
    destLat,
    destLon,
    destName,
  } = useLocalSearchParams<{
    platformName: string;
    platformApp: string;
    productId: string;
    price: string;
    priceMin: string;
    priceMax: string;
    confidence: string;
    acceptanceProbability: string;
    originLat: string;
    originLon: string;
    originName: string;
    destLat: string;
    destLon: string;
    destName: string;
  }>();

  const handleOpenApp = async () => {
    if (platformApp === "99") {
      router.push({
        pathname: "/instructions99",
        params: {
          originName,
          destName,
          originLat,
          originLon,
          destLat,
          destLon,
        },
      });
      return;
    }

    let url = "";
    if (platformApp === "uber") {
      url =
        `https://m.uber.com/ul/?client_id=Xk7SRRSR6RYsBhYVez1t_Icqfj4xzQer` +
        `&action=setPickup` +
        `&pickup[latitude]=${originLat}` +
        `&pickup[longitude]=${originLon}` +
        `&pickup[nickname]=${encodeURIComponent(originName || "Origem")}` +
        `&dropoff[latitude]=${destLat}` +
        `&dropoff[longitude]=${destLon}` +
        `&dropoff[nickname]=${encodeURIComponent(destName || "Destino")}` +
        `&product_id=${productId}`;
    }

    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível abrir o aplicativo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={30}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Plataforma e preço */}
        <View style={styles.block}>
          <Text style={styles.label}>Plataforma selecionada</Text>
          <Text style={styles.platformName}>{platformName}</Text>
          <Text style={styles.price}>R$ {price}</Text>
        </View>

        <View style={styles.divider} />

        {/* Faixa de preço */}
        <View style={styles.block}>
          <Text style={styles.label}>Faixa de preço estimada</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valor mínimo</Text>
            <Text style={styles.rowValue}>R$ {priceMin || "--"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valor máximo</Text>
            <Text style={styles.rowValue}>R$ {priceMax || "--"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Rota */}
        <View style={styles.block}>
          <Text style={styles.label}>Rota</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Origem</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {originName || `${originLat}, ${originLon}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Destino</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {destName || `${destLat}, ${destLon}`}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dados do modelo */}
        {confidence ? (
          <View style={styles.block}>
            <Text style={styles.label}>Inteligência Artificial</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Taxa de confiança</Text>
              <Text style={styles.rowValue}>
                {(parseFloat(confidence) * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Probabilidade de aceitação</Text>
              <Text style={styles.rowValue}>
                {(parseFloat(acceptanceProbability) * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Botões */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleOpenApp}>
          <Text style={styles.btnPrimaryText}>Abrir {platformName}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 16,
    gap: 0,
  },
  block: {
    paddingVertical: 20,
    gap: 8,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 4,
  },
  platformName: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  price: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.muted,
  },
  rowValue: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 0.5,
    backgroundColor: theme.colors.border,
  },
  actions: {
    paddingBottom: 16,
    gap: 12,
  },
  disclaimer: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.muted,
    textAlign: "center",
  },
  btnPrimary: {
    borderWidth: 1,
    borderColor: theme.colors.text,
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 30,
  },
  btnPrimaryText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  btnGhost: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    textAlign: "center",
  },
});
