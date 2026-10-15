import { theme } from "@/constants/theme";
import { LocationRecommendation } from "@/services/intelligence";
import { getTrip } from "@/services/trip-service";
import { TripResult } from "@/types/trip";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PriceSheetProps {
  originLat: number;
  originLon: number;
  originName?: string;
  destLat: number;
  destLon: number;
  destName?: string;
  onSelectRecommendation?: (rec: LocationRecommendation) => void;
}

type PriceItem = TripResult["prices"][0];

const TRAY_BG = "rgba(12,12,12,0.96)";
const TRAY_BORDER = "#1f1f1f";
const GROUP_BG = "#161616";
const ICON_BG = "#222224";

export default function PriceSheet({
  originLat,
  originLon,
  originName,
  destLat,
  destLon,
  destName,
}: PriceSheetProps) {
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getTrip(
          { lat: originLat, lon: originLon },
          { lat: destLat, lon: destLon },
        );
        if (ativo) setResult(data);
      } catch {
        if (ativo) setResult(null);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    load();

    return () => {
      ativo = false;
    };
  }, [originLat, originLon, destLat, destLon]);

  const handleSelectRide = (item: PriceItem) => {
    router.push({
      pathname: "/confirm",
      params: {
        platformId: item.platform.id,
        platformName: item.platform.name,
        platformApp: item.platform.app,
        productId: item.platform.productId ?? "",
        price: item.price.toFixed(2),
        priceMin: item.prediction?.price_min?.toFixed(2) ?? "",
        priceMax: item.prediction?.price_max?.toFixed(2) ?? "",
        confidence: item.prediction?.confidence?.toFixed(2) ?? "",
        acceptanceProbability:
          item.prediction?.acceptance_probability?.toFixed(2) ?? "",
        originLat: originLat.toString(),
        originLon: originLon.toString(),
        originName: originName ?? "",
        destLat: destLat.toString(),
        destLon: destLon.toString(),
        destName: destName ?? "",
        // novos: usados para salvar a corrida no Supabase
        distanceKm: result ? result.distanceKm.toString() : "",
        durationMin: result ? result.durationMin.toString() : "",
      },
    });
  };

  const handleOpenRecommendations = () => {
    router.push({
      pathname: "/recommendations",
      params: {
        originLat: originLat.toString(),
        originLon: originLon.toString(),
        destLat: destLat.toString(),
        destLon: destLon.toString(),
        distanciaKm: result ? result.distanceKm.toString() : "0",
        duracaoMin: result ? result.durationMin.toString() : "0",
        plataforma: result?.prices[0]?.platform.app ?? "uber",
        categoria: result?.prices[0]?.platform.id ?? "uber-x",
        precoEstimado: result?.prices[0]?.price.toString() ?? "0",
      },
    });
  };

  const containerStyle = [styles.container, { bottom: 8 }];

  if (loading) {
    return (
      <View style={[containerStyle, styles.stateBox]}>
        <View style={styles.handle} />
        <ActivityIndicator size="small" color={theme.colors.muted} />
        <Text style={styles.stateText}>Buscando preços...</Text>
      </View>
    );
  }

  if (!result || result.prices.length === 0) {
    return (
      <View style={[containerStyle, styles.stateBox]}>
        <View style={styles.handle} />
        <MaterialIcons
          name="error-outline"
          size={28}
          color={theme.colors.muted}
        />
        <Text style={styles.stateText}>
          Não foi possível obter os preços agora.
        </Text>
      </View>
    );
  }

  const cheapest = result.prices[0];
  const others = result.prices.slice(1);

  return (
    <View style={containerStyle}>
      <View style={styles.handle} />

      {/* Cabeçalho da bandeja */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {destName ? `Para ${destName}` : "Sua corrida"}
          </Text>
          <Text style={styles.subtitle}>
            {result.distanceKm.toFixed?.(1) ?? result.distanceKm} km ·{" "}
            {Math.round(result.durationMin)} min
          </Text>
        </View>
      </View>

      {/* Botão principal, estilo "Rotas" do Apple Maps */}
      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={() => handleSelectRide(cheapest)}
      >
        <MaterialIcons name="directions-car" size={22} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.primaryTitle} numberOfLines={1}>
            {cheapest.platform.name}
          </Text>
          <Text style={styles.primaryTag}>Mais barato agora</Text>
        </View>
        <Text style={styles.primaryPrice}>R$ {cheapest.price.toFixed(2)}</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.scroll}
        contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
      >
        {/* Outras opções */}
        {others.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>Outras opções</Text>
            <View style={styles.group}>
              {others.map((item, index) => (
                <React.Fragment key={item.platform.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.listRow}
                    activeOpacity={0.6}
                    onPress={() => handleSelectRide(item)}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialIcons
                        name="local-taxi"
                        size={18}
                        color={theme.colors.text}
                      />
                    </View>
                    <Text style={styles.platformName} numberOfLines={1}>
                      {item.platform.name}
                    </Text>
                    <View style={styles.rowRight}>
                      <Text style={styles.price}>
                        R$ {item.price.toFixed(2)}
                      </Text>
                      <Text style={styles.diff}>
                        +R$ {(item.price - cheapest.price).toFixed(2)}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={14}
                      color="#5a5a5e"
                    />
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Recomendações */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.listRow}
            activeOpacity={0.6}
            onPress={handleOpenRecommendations}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialIcons name="savings" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.platformName}>Recomendações de economia</Text>
              <Text style={styles.diff}>
                Embarque em outro ponto e pague menos
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#5a5a5e" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 8,
    right: 8,
    backgroundColor: TRAY_BG,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: TRAY_BORDER,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
    maxHeight: "50%",
  },
  stateBox: {
    alignItems: "center",
    paddingVertical: 28,
  },
  stateText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    textAlign: "center",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3a3a3c",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 22,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: "#fff",
  },
  primaryTag: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: "rgba(255,255,255,0.75)",
  },
  primaryPrice: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: "#fff",
  },
  scroll: {
    flexShrink: 1,
  },
  sectionLabel: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    paddingHorizontal: 12,
  },
  group: {
    backgroundColor: GROUP_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TRAY_BORDER,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: TRAY_BORDER,
    marginLeft: 64, // recuo alinhado ao texto, como no iOS
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  price: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  diff: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
});
