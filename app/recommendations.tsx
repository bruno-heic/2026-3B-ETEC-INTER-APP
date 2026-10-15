import { theme } from "@/constants/theme";
import {
  getRecommendations,
  getRisk,
  LocationRecommendation,
  RecommendResult,
  RiskResult,
} from "@/services/intelligence";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const toStr = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

function Header({ title }: { title?: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.circleButton}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
      </TouchableOpacity>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
    </View>
  );
}

export default function Recommendations() {
  const params = useLocalSearchParams<{
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
  const [failed, setFailed] = useState(false);

  const oLat = parseFloat(toStr(params.originLat));
  const oLon = parseFloat(toStr(params.originLon));
  const dLat = parseFloat(toStr(params.destLat));
  const dLon = parseFloat(toStr(params.destLon));
  const distanciaKm = parseFloat(toStr(params.distanciaKm));
  const duracaoMin = parseFloat(toStr(params.duracaoMin));
  const plataforma = toStr(params.plataforma);
  const categoria = toStr(params.categoria);
  const precoEstimado = parseFloat(toStr(params.precoEstimado));

  useEffect(() => {
    let ativo = true;

    async function fetchData() {
      try {
        // Busca risco e recomendações em paralelo
        const [riskData, recData] = await Promise.all([
          getRisk(oLat, oLon),
          getRecommendations(
            oLat,
            oLon,
            dLat,
            dLon,
            distanciaKm,
            duracaoMin,
            plataforma,
            categoria,
            precoEstimado,
          ),
        ]);
        if (!ativo) return;
        setRisk(riskData);
        setRecommendations(recData);
      } catch {
        if (ativo) setFailed(true);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    fetchData();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.text} />
          <Text style={styles.loadingText}>Analisando a área...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (failed) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Recomendações" />
        <View style={styles.center}>
          <MaterialIcons
            name="error-outline"
            size={32}
            color={theme.colors.muted}
          />
          <Text style={styles.loadingText}>
            Não foi possível carregar as recomendações.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeRec = recommendations?.time_recommendation;
  const locationRecs = recommendations?.location_recommendations ?? [];
  const hasAnything = !!timeRec || locationRecs.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Recomendações" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Risco da área atual */}
        {risk && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sua localização atual</Text>
            <View style={styles.card}>
              <View style={styles.riskRow}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${RISK_COLORS[risk.risk_level]}22` },
                  ]}
                >
                  <MaterialIcons
                    name={RISK_ICONS[risk.risk_level] as any}
                    size={20}
                    color={RISK_COLORS[risk.risk_level]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.riskLabel,
                      { color: RISK_COLORS[risk.risk_level] },
                    ]}
                  >
                    Risco {risk.risk_label}
                  </Text>
                  <Text style={styles.mutedText}>
                    {risk.total_crimes_nearby} ocorrências em 500 m
                  </Text>
                </View>
              </View>

              {risk.most_common_crime && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.mutedText}>Tipo mais comum</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {risk.most_common_crime}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Recomendação de horário */}
        {timeRec && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recomendação de horário</Text>
            <View style={styles.card}>
              <View style={styles.riskRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name="schedule"
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
                <Text style={styles.recMessage}>{timeRec.message}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.mutedText}>Economia</Text>
                <Text style={styles.economy}>
                  R$ {timeRec.economy.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Pontos alternativos de embarque */}
        {locationRecs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Pontos alternativos de embarque
            </Text>
            <View style={styles.card}>
              {locationRecs.map((rec, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.recRow}
                    activeOpacity={0.7}
                    onPress={() => handleSelectLocation(rec)}
                  >
                    <View style={{ flex: 1, gap: 6 }}>
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
                        <Text style={styles.mutedSmall}>
                          · {rec.distance_meters} m
                        </Text>
                      </View>

                      <Text style={styles.recPrice}>
                        R$ {rec.new_price.toFixed(2)}
                      </Text>

                      {rec.most_common_crime && (
                        <Text style={styles.mutedSmall} numberOfLines={1}>
                          {rec.most_common_crime}
                        </Text>
                      )}
                    </View>

                    <View style={styles.recRight}>
                      <View style={styles.economyBadge}>
                        <Text style={styles.economyBadgeText}>
                          -R$ {rec.economy.toFixed(2)}
                        </Text>
                      </View>
                      <MaterialIcons
                        name="arrow-forward-ios"
                        size={16}
                        color={theme.colors.muted}
                      />
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Nenhuma recomendação */}
        {!hasAnything && (
          <View style={styles.card}>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 48,
  },
  loadingText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    textAlign: "center",
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 24,
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  riskLabel: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
  },
  mutedText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  mutedSmall: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoValue: {
    flexShrink: 1,
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    textAlign: "right",
  },
  recMessage: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  economy: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: RISK_COLORS.low,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recRiskLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
  },
  recPrice: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 24,
    color: theme.colors.text,
  },
  recRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  economyBadge: {
    backgroundColor: "rgba(68,255,204,0.14)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  economyBadgeText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: RISK_COLORS.low,
  },
  noRec: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    lineHeight: 22,
    textAlign: "center",
  },
});
