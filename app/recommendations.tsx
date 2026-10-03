import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import {
  getRisk,
  getRecommendations,
  RiskResult,
  RecommendResult,
  LocationRecommendation,
} from "@/services/intelligence";

const RISK_COLORS = {
  low: "#44ffcc",
  medium: "#FFD700",
  high: "#FF4444",
};

const RISK_ICONS = {
  low: "check-circle",
  medium: "warning",
  high: "error",
};

export default function Recommendations() {
  const {
    originLat,
    originLon,
    destLat,
    destLon,
    distanciaKm,
    duracaoMin,
    plataforma,
    categoria,
    precoEstimado,
  } = useLocalSearchParams<{
    originLat: string;
    originLon: string;
    destLat: string;
    destLon: string;
    distanciaKm: string;
    duracaoMin: string;
    plataforma: string;
    categoria: string;
    precoEstimado: string;
  }>();

  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [recommendations, setRecommendations] =
    useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(true);

  const oLat = parseFloat(originLat);
  const oLon = parseFloat(originLon);
  const dLat = parseFloat(destLat);
  const dLon = parseFloat(destLon);

  useEffect(() => {
    async function fetchData() {
      // Busca risco e recomendações em paralelo
      const [riskData, recData] = await Promise.all([
        getRisk(oLat, oLon),
        getRecommendations(
          oLat,
          oLon,
          dLat,
          dLon,
          parseFloat(distanciaKm),
          parseFloat(duracaoMin),
          plataforma,
          categoria,
          parseFloat(precoEstimado),
        ),
      ]);
      setRisk(riskData);
      setRecommendations(recData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSelectLocation = (rec: LocationRecommendation) => {
    // Volta para o result com o ponto recomendado
    router.back();
    // Pequeno delay para garantir que o result.tsx montou
    setTimeout(() => {
      router.setParams({
        recommendedLat: rec.lat.toString(),
        recommendedLon: rec.lon.toString(),
      });
    }, 300);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.muted} />
          <Text style={styles.loadingText}>Analisando a área...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>recomendações</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Risco da área atual */}
        {risk && (
          <View style={styles.block}>
            <Text style={styles.label}>sua localização atual</Text>
            <View style={styles.riskRow}>
              <MaterialIcons
                name={RISK_ICONS[risk.risk_level] as any}
                size={20}
                color={RISK_COLORS[risk.risk_level]}
              />
              <Text
                style={[
                  styles.riskLabel,
                  { color: RISK_COLORS[risk.risk_level] },
                ]}
              >
                Risco {risk.risk_label}
              </Text>
              <Text style={styles.riskCount}>
                · {risk.total_crimes_nearby} ocorrências em 500m
              </Text>
            </View>
            {risk.most_common_crime && (
              <Text style={styles.riskCrime}>
                Tipo mais comum: {risk.most_common_crime}
              </Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Recomendação de horário */}
        {recommendations?.time_recommendation && (
          <>
            <View style={styles.block}>
              <Text style={styles.label}>recomendação de horário</Text>
              <Text style={styles.recMessage}>
                {recommendations.time_recommendation.message}
              </Text>
              <Text style={styles.economy}>
                economia de R${" "}
                {recommendations.time_recommendation.economy.toFixed(2)}
              </Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Recomendações de localização */}
        {recommendations?.location_recommendations &&
          recommendations.location_recommendations.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.label}>pontos alternativos de embarque</Text>
              {recommendations.location_recommendations.map((rec, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recCard}
                  onPress={() => handleSelectLocation(rec)}
                >
                  <View style={styles.recHeader}>
                    <MaterialIcons
                      name={RISK_ICONS[rec.risk_level] as any}
                      size={16}
                      color={RISK_COLORS[rec.risk_level]}
                    />
                    <Text
                      style={[
                        styles.recRiskLabel,
                        { color: RISK_COLORS[rec.risk_level] },
                      ]}
                    >
                      Risco {rec.risk_label}
                    </Text>
                    <Text style={styles.recDistance}>
                      · {rec.distance_meters}m de distância
                    </Text>
                  </View>
                  <View style={styles.recDetails}>
                    <View>
                      <Text style={styles.recPrice}>
                        R$ {rec.new_price.toFixed(2)}
                      </Text>
                      {rec.most_common_crime && (
                        <Text style={styles.recCrime}>
                          {rec.most_common_crime}
                        </Text>
                      )}
                    </View>
                    <View style={styles.recEconomyBlock}>
                      <Text style={styles.recEconomy}>
                        -{rec.economy.toFixed(2)}
                      </Text>
                      <MaterialIcons
                        name="arrow-forward"
                        size={14}
                        color={theme.colors.muted}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Nenhuma recomendação */}
        {!recommendations?.time_recommendation &&
          (!recommendations?.location_recommendations ||
            recommendations.location_recommendations.length === 0) && (
            <View style={styles.block}>
              <Text style={styles.noRec}>
                Nenhuma recomendação disponível para esta rota no momento.
              </Text>
            </View>
          )}
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  headerTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  scroll: {
    flex: 1,
  },
  block: {
    paddingVertical: 20,
    gap: 10,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.muted,
  },
  divider: {
    height: 0.5,
    backgroundColor: theme.colors.border,
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  riskLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
  },
  riskCount: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  riskCrime: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  recMessage: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  economy: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.accent,
  },
  recCard: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.border,
    gap: 8,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recRiskLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
  },
  recDistance: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  recDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  recCrime: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.muted,
    marginTop: 2,
  },
  recEconomyBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recEconomy: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.accent,
  },
  noRec: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    lineHeight: 22,
  },
});
