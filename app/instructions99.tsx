import { theme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const STEPS = [
  "Copie os endereços abaixo.",
  "Abra o app da 99.",
  "No campo de origem, cole o endereço de embarque.",
  "No campo de destino, cole o endereço de destino.",
  "Confirme a corrida.",
];

export default function Instructions99() {
  const params = useLocalSearchParams<{
    originName: string;
    destName: string;
    originLat: string;
    originLon: string;
    destLat: string;
    destLon: string;
  }>();

  const originName = toStr(params.originName);
  const destName = toStr(params.destName);
  const originLat = toStr(params.originLat);
  const originLon = toStr(params.originLon);
  const destLat = toStr(params.destLat);
  const destLon = toStr(params.destLon);

  const originText = originName || `${originLat}, ${originLon}`;
  const destText = destName || `${destLat}, ${destLon}`;

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Evita atualizar o estado depois de sair da tela
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(`De: ${originText}\nPara: ${destText}`);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 3000);
  };

  const handleOpen99 = async () => {
    try {
      await Linking.openURL("99app://");
    } catch {
      try {
        await Linking.openURL("https://99app.com");
      } catch {
        Alert.alert("Erro", "Não foi possível abrir o app da 99.");
      }
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

        <Text style={styles.headerTitle}>Solicitar na 99</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Como solicitar sua corrida na 99</Text>

        {/* Passo a passo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Passo a passo</Text>
          <View style={styles.card}>
            {STEPS.map((step, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Endereços */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Endereços</Text>
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <MaterialIcons name="my-location" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTag}>De</Text>
                <Text style={styles.addressText} numberOfLines={3}>
                  {originText}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <MaterialIcons name="place" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTag}>Para</Text>
                <Text style={styles.addressText} numberOfLines={3}>
                  {destText}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnCopy}
          activeOpacity={0.8}
          onPress={handleCopy}
        >
          <MaterialIcons
            name={copied ? "check" : "content-copy"}
            size={20}
            color={copied ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.btnCopyText,
              copied && { color: theme.colors.primary },
            ]}
          >
            {copied ? "Endereços copiados" : "Copiar endereços"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.8}
          onPress={handleOpen99}
        >
          <Text style={styles.btnPrimaryText}>Abrir app da 99</Text>
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
  title: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 24,
    color: theme.colors.text,
    lineHeight: 30,
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
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  stepText: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  addressTag: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  addressText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  actions: {
    paddingBottom: 16,
    gap: 12,
  },
  btnCopy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1C1C1E",
    borderRadius: 32,
    paddingVertical: 18,
  },
  btnCopyText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
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
