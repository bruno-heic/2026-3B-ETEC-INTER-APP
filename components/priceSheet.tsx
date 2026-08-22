import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { getTrip } from "@/services/trip-service";
import { TripResult } from "@/types/trip";
import { LocationRecommendation } from "@/services/intelligence";

interface PriceSheetProps {
  originLat: number;
  originLon: number;
  originName?: string;
  destLat: number;
  destLon: number;
  destName?: string;
  onSelectRecommendation?: (rec: LocationRecommendation) => void;
}

export default function PriceSheet({
  originLat,
  originLon,
  originName,
  destLat,
  destLon,
  destName,
  onSelectRecommendation,
}: PriceSheetProps) {
  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const data = await getTrip(
        { lat: originLat, lon: originLon },
        { lat: destLat, lon: destLon },
      );
      setResult(data);
      setLoading(false);
    }
    fetch();
  }, [originLat, originLon, destLat, destLon]);

  const handleSelectRide = (item: TripResult["prices"][0]) => {
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
        acceptanceProbability: item.prediction?.acceptance_probability?.toFixed(2) ?? "",
        originLat: originLat.toString(),
        originLon: originLon.toString(),
        originName: originName ?? "",
        destLat: destLat.toString(),
        destLon: destLon.toString(),
        destName: destName ?? "",
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
        distanciaKm: result ? (result.distanceKm).toString() : "0",
        duracaoMin: result ? (result.durationMin).toString() : "0",
        plataforma: result?.prices[0]?.platform.app ?? "uber",
        categoria: result?.prices[0]?.platform.id ?? "uber-x",
        precoEstimado: result?.prices[0]?.price.toString() ?? "0",
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.muted} />
      </View>
    );
  }

  if (!result) return null;

  const cheapest = result.prices[0];

  return (
    <View style={styles.container}>
      <View style={styles.bestBlock}>
        <Text style={styles.bestPlatform}>O mais barato agora é</Text>
        <TouchableOpacity onPress={() => handleSelectRide(cheapest)} style={{ gap: 5 }}>
          <Text style={styles.bestLabel}>{cheapest.platform.name}</Text>
          <Text style={styles.bestPrice}>R$ {cheapest.price.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={result.prices.slice(1)}
        keyExtractor={(item) => item.platform.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleSelectRide(item)}
          >
            <Text style={styles.platformName}>{item.platform.name}</Text>
            <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
            <Text style={styles.diff}>
              +R$ {(item.price - cheapest.price).toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Botão de recomendações */}
      <TouchableOpacity style={styles.recommendBtn} onPress={handleOpenRecommendations}>
        <Text style={styles.recommendText}>Ver recomendações de economia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 0.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: "50%",
  },
  bestBlock: {
    marginBlock: 20,
    gap: 10,
  },
  bestPlatform: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  bestPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: 25,
    color: theme.colors.text,
  },
  bestLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    justifyContent: "flex-start",
  },
  platformName: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    width: 140,
    textAlign: "left",
  },
  price: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    width: 120,
    textAlign: "left",
  },
  diff: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    textAlign: "left",
  },
  recommendBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  recommendText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
});