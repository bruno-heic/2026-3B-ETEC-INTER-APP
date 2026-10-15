import { theme } from "@/constants/theme";
import { loadSettings } from "@/services/settings";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const toStr = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

const toNumOrNull = (v: string) => {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

type RowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoRow({ label, value, highlight }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, highlight && { color: theme.colors.primary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function Confirm() {
  const params = useLocalSearchParams<{
    platformId: string;
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
    distanceKm: string;
    durationMin: string;
  }>();

  const platformId = toStr(params.platformId);
  const platformName = toStr(params.platformName);
  const platformApp = toStr(params.platformApp);
  const productId = toStr(params.productId);
  const price = toStr(params.price);
  const priceMin = toStr(params.priceMin);
  const priceMax = toStr(params.priceMax);
  const confidence = toStr(params.confidence);
  const acceptanceProbability = toStr(params.acceptanceProbability);
  const originLat = toStr(params.originLat);
  const originLon = toStr(params.originLon);
  const originName = toStr(params.originName);
  const destLat = toStr(params.destLat);
  const destLon = toStr(params.destLon);
  const destName = toStr(params.destName);
  const distanceKm = toStr(params.distanceKm);
  const durationMin = toStr(params.durationMin);

  const rideSavedRef = useRef(false);

  const hasModelData = !!confidence;
  const toPercent = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : "--";
  };

  // Nunca bloqueia o fluxo: se falhar, só registra o erro no console.
  const saveRide = async () => {
    if (rideSavedRef.current) return; // evita duplicar na mesma tela

    try {
      const oLat = toNumOrNull(originLat);
      const oLon = toNumOrNull(originLon);
      const dLat = toNumOrNull(destLat);
      const dLon = toNumOrNull(destLon);
      const priceNum = toNumOrNull(price);

      if (
        oLat === null ||
        oLon === null ||
        dLat === null ||
        dLon === null ||
        priceNum === null
      ) {
        console.error("Corrida não salva: dados inválidos.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("rides").insert({
        user_id: user.id,

        origin_name: originName || null,
        origin_lat: oLat,
        origin_lon: oLon,
        dest_name: destName || null,
        dest_lat: dLat,
        dest_lon: dLon,

        distance_km: toNumOrNull(distanceKm),
        duration_min: toNumOrNull(durationMin),

        platform_id: platformId,
        platform_name: platformName,
        platform_app: platformApp,
        product_id: productId || null,
        price: priceNum,
        price_min: toNumOrNull(priceMin),
        price_max: toNumOrNull(priceMax),
        confidence: toNumOrNull(confidence),
        acceptance_probability: toNumOrNull(acceptanceProbability),

        status: "requested",
      });

      if (error) {
        console.error("Erro ao salvar corrida:", error.message);
        return;
      }

      rideSavedRef.current = true;
    } catch (e) {
      console.error("Erro ao salvar corrida:", e);
    }
  };

  const handleOpenApp = async () => {
    const settings = await loadSettings();

    if (settings.confirmBeforeOpen) {
      const ok = await new Promise<boolean>((resolve) =>
        Alert.alert(
          `Abrir ${platformName}?`,
          "Você será levado ao aplicativo para concluir o pedido.",
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => resolve(false),
            },
            { text: "Abrir", onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        ),
      );
      if (!ok) return;
    }

    if (settings.saveHistory) await saveRide();
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

    if (!url) {
      Alert.alert("Erro", "Plataforma não suportada.");
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível abrir o aplicativo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.circleButton}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Confirmar corrida</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Plataforma e preço */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Plataforma selecionada</Text>
          <Text style={styles.heroName}>{platformName}</Text>
          <Text style={styles.heroPrice}>R$ {price}</Text>
        </View>

        {/* Faixa de preço */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Faixa de preço estimada</Text>
          <View style={styles.card}>
            <InfoRow label="Valor mínimo" value={`R$ ${priceMin || "--"}`} />
            <View style={styles.divider} />
            <InfoRow label="Valor máximo" value={`R$ ${priceMax || "--"}`} />
          </View>
        </View>

        {/* Rota */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rota</Text>
          <View style={styles.card}>
            <View style={styles.routeRow}>
              <View style={styles.routeIcon}>
                <MaterialIcons name="my-location" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTag}>Origem</Text>
                <Text style={styles.routeText} numberOfLines={2}>
                  {originName || `${originLat}, ${originLon}`}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.routeRow}>
              <View style={styles.routeIcon}>
                <MaterialIcons name="place" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTag}>Destino</Text>
                <Text style={styles.routeText} numberOfLines={2}>
                  {destName || `${destLat}, ${destLon}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dados do modelo */}
        {hasModelData && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Inteligência artificial</Text>
            <View style={styles.card}>
              <InfoRow
                label="Taxa de confiança"
                value={toPercent(confidence)}
                highlight
              />
              <View style={styles.divider} />
              <InfoRow
                label="Probabilidade de aceitação"
                value={toPercent(acceptanceProbability)}
                highlight
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botão principal */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.8}
          onPress={handleOpenApp}
        >
          <Text style={styles.btnPrimaryText}>Abrir {platformName}</Text>
          <MaterialIcons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: 48,
  },
  circleButton: {
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
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: theme.fonts.sansSemiBold,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    zIndex: 0,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 12,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 4,
  },
  heroLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  heroName: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 24,
    color: theme.colors.text,
  },
  heroPrice: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 44,
    color: theme.colors.text,
    marginTop: 4,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#1C1C1E",
    padding: 24,
    borderRadius: 32,
    gap: 20,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  rowValue: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  routeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  routeTag: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  routeText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  actions: {
    paddingBottom: 16,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 32,
    paddingVertical: 18,
  },
  btnPrimaryText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: "#fff",
  },
});
