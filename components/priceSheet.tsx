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
import { getTrip, TripResult } from "@/services/trip-service";

interface PriceSheetProps {
  originLat: number;
  originLon: number;
  originName?: string;
  destLat: number;
  destLon: number;
  destName?: string;
}

export default function PriceSheet({
  originLat,
  originLon,
  originName,
  destLat,
  destLon,
  destName,
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
      <View style={styles.handle} />

      <Text style={styles.disclaimer}>
        Estimativa de preço. Pode haver variação no valor real.
      </Text>

      {cheapest.isPeak && (
        <Text style={styles.peakWarning}>
          horário de pico · preços elevados
        </Text>
      )}

      <View style={styles.bestBlock}>
        <Text style={styles.bestPlatform}>O mais barato agora é:</Text>
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
    paddingTop: 12,
    maxHeight: "50%",
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: theme.colors.borderStrong,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  peakWarning: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  bestBlock: {
    marginBlock: 35,
    gap: 10,
  },
  bestPlatform: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  bestPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  bestLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.accent,
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
  disclaimer: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.muted,
    textAlign: "center",
  },
});