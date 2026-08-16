import React, { useState } from "react";
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
import * as Clipboard from "expo-clipboard";
import { theme } from "@/constants/theme";

export default function Instructions99() {
  const {
    originName,
    destName,
    originLat,
    originLon,
    destLat,
    destLon,
  } = useLocalSearchParams<{
    originName: string;
    destName: string;
    originLat: string;
    originLon: string;
    destLat: string;
    destLon: string;
  }>();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `De: ${originName || `${originLat}, ${originLon}`}\nPara: ${destName || `${destLat}, ${destLon}`}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpen99 = async () => {
    try {
      await Linking.openURL("99app://");
    } catch {
      // fallback para a Play Store / App Store
      await Linking.openURL("https://99app.com");
    }
  };

  const steps = [
    "Copie os endereços abaixo.",
    "Abra o app da 99.",
    "No campo de origem, cole o endereço de embarque.",
    "No campo de destino, cole o endereço de destino.",
    "Confirme a corrida.",
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Título */}
        <View style={styles.block}>
          <Text style={styles.title}>Como solicitar corrida na 99</Text>
        </View>

        {/* Passo a passo */}
        <View style={styles.block}>
          {steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Endereços */}
        <View style={styles.block}>
          <Text style={styles.label}>Endereços</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>De:</Text>
            <Text style={styles.rowValue} numberOfLines={2}>
              {originName || `${originLat}, ${originLon}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Para:</Text>
            <Text style={styles.rowValue} numberOfLines={2}>
              {destName || `${destLat}, ${destLon}`}
            </Text>
          </View>
        </View>

      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnCopy} onPress={handleCopy}>
          <Text style={styles.btnCopyText}>
            {copied ? "Endereços copiados ✓" : "Copiar endereços"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleOpen99}>
          <Text style={styles.btnPrimaryText}>Abrir app da 99</Text>
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
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  block: {
    paddingVertical: 20,
    gap: 12,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.muted,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    lineHeight: 28,
    width: "80%",
  },
  divider: {
    height: 0.5,
    backgroundColor: theme.colors.border,
  },
  step: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    width: 25,
  },
  stepText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  rowLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    width: 48,
  },
  rowValue: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
    textAlign: "left",
  },
  actions: {
    paddingBottom: 16,
    gap: 12,
  },
  btnCopy: {
    borderWidth: 0.5,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 30,
  },
  btnCopyText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
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
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  btnGhost: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    textAlign: "center",
  },
});