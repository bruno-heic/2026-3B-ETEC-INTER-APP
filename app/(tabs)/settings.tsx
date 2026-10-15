import { theme } from "@/constants/theme";
import { signOutUser } from "@/services/auth";
import { clearSettings, HistoryPeriod, useSettings } from "@/services/settings";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: troque pelos seus dados
const FEEDBACK_EMAIL = "agno.seles@aluno.cps.sp.gov.br";
const TERMS_URL = "https://aj3838.github.io/2026-WEBSITE-INTER-RIDELESS/";
const PRIVACY_URL = "https://aj3838.github.io/2026-WEBSITE-INTER-RIDELESS/";

const DANGER = "#c83232";

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "all", label: "Tudo" },
];

type IconName = keyof typeof MaterialIcons.glyphMap;

/* --------------------------- componentes --------------------------- */

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.rowBetween}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#353535", true: theme.colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor="#353535"
      />
    </View>
  );
}

function LinkRow({
  icon,
  label,
  value,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.linkRow}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={disabled}
    >
      <MaterialIcons name={icon} size={20} color={theme.colors.muted} />
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <MaterialIcons
        name="arrow-forward-ios"
        size={16}
        color={theme.colors.muted}
      />
    </TouchableOpacity>
  );
}

/* ------------------------------- tela ------------------------------- */

export default function Settings() {
  const { settings, update, ready } = useSettings();
  const [locGranted, setLocGranted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshLocation = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocGranted(status === Location.PermissionStatus.GRANTED);
    } catch {
      setLocGranted(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshLocation();
    }, [refreshLocation]),
  );

  // Atualiza o status ao voltar dos ajustes do sistema
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshLocation();
    });
    return () => sub.remove();
  }, [refreshLocation]);

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o link.");
    }
  };

  const clearTable = (
    table: "rides" | "favorite_routes",
    title: string,
    message: string,
    done: string,
  ) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
              .from(table)
              .delete()
              .eq("user_id", user.id);

            if (error) throw error;

            Alert.alert("Pronto", done);
          } catch (e) {
            console.error(`Erro ao apagar ${table}:`, e);
            Alert.alert(
              "Erro",
              "Não foi possível apagar agora. Tente de novo.",
            );
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Sua conta, seu histórico de corridas e seus atalhos serão apagados de forma permanente. Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir conta",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase.rpc("delete_my_account");
              if (error) throw error;

              await clearSettings(user.id);
              await signOutUser(); // a sessão local é limpa mesmo se o servidor reclamar

              if (router.canDismiss()) router.dismissAll();
              router.replace("/(auth)/signIn");
            } catch (e) {
              console.error("Erro ao excluir conta:", e);
              Alert.alert(
                "Erro",
                "Não foi possível excluir a conta agora. Tente novamente.",
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const version = Constants.expoConfig?.version ?? "1.0.0";

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

        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Comportamento */}
          <View style={styles.section}>
            <SectionLabel>Comportamento</SectionLabel>
            <View style={styles.card}>
              <ToggleRow
                label="Confirmar antes de abrir o app"
                description="Mostra um aviso antes de abrir o Uber ou a 99."
                value={settings.confirmBeforeOpen}
                onValueChange={(v) => update({ confirmBeforeOpen: v })}
              />
              <Divider />
              <ToggleRow
                label="Salvar corridas no histórico"
                description="Registra a corrida quando você abre a plataforma."
                value={settings.saveHistory}
                onValueChange={(v) => update({ saveHistory: v })}
              />
              <Divider />
              <ToggleRow
                label="Gráficos no histórico"
                description="Mostra gráficos e estatísticas acima da lista."
                value={settings.showInsights}
                onValueChange={(v) => update({ showInsights: v })}
              />
              <Divider />
              <View style={{ gap: 12 }}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.rowLabel}>
                    Período inicial do histórico
                  </Text>
                  <Text style={styles.rowDesc}>
                    Filtro usado ao abrir a tela de histórico.
                  </Text>
                </View>
                <View style={styles.segment}>
                  {PERIODS.map((p) => {
                    const active = settings.historyPeriod === p.key;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        style={[
                          styles.segmentItem,
                          active && { backgroundColor: theme.colors.primary },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => update({ historyPeriod: p.key })}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            active && {
                              color: "#fff",
                              fontFamily: theme.fonts.sansSemiBold,
                            },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Privacidade e dados */}
          <View style={styles.section}>
            <SectionLabel>Privacidade e dados</SectionLabel>
            <View style={styles.card}>
              <LinkRow
                icon="location-on"
                label="Localização"
                value={
                  locGranted === null
                    ? "--"
                    : locGranted
                      ? "Permitida"
                      : "Não permitida"
                }
                onPress={() => Linking.openSettings()}
              />
              <Divider />
              <LinkRow
                icon="history"
                label="Limpar histórico de corridas"
                onPress={() =>
                  clearTable(
                    "rides",
                    "Limpar histórico",
                    "Todas as corridas salvas serão apagadas. Essa ação não pode ser desfeita.",
                    "Histórico apagado.",
                  )
                }
              />
              <Divider />
              <LinkRow
                icon="shortcut"
                label="Apagar atalhos de rotas"
                onPress={() =>
                  clearTable(
                    "favorite_routes",
                    "Apagar atalhos",
                    "Todos os seus atalhos de rotas serão apagados. Essa ação não pode ser desfeita.",
                    "Atalhos apagados.",
                  )
                }
              />
            </View>
          </View>

          {/* Sobre e ajuda */}
          <View style={styles.section}>
            <SectionLabel>Sobre e ajuda</SectionLabel>
            <View style={styles.card}>
              <LinkRow
                icon="help-outline"
                label="Como funcionam as estimativas"
                onPress={() =>
                  Alert.alert(
                    "Como funcionam as estimativas",
                    "Os valores exibidos são previsões, com uma faixa de preço mínima e máxima e uma taxa de confiança. O preço final é definido pelo Uber ou pela 99 no momento do pedido e pode ser diferente do estimado.",
                  )
                }
              />
              <Divider />
              <LinkRow
                icon="mail-outline"
                label="Enviar feedback"
                onPress={() =>
                  openUrl(
                    `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Feedback do app")}`,
                  )
                }
              />
              <Divider />
              <LinkRow
                icon="description"
                label="Termos de uso"
                onPress={() => openUrl(TERMS_URL)}
              />
              <Divider />
              <LinkRow
                icon="lock"
                label="Política de privacidade"
                onPress={() => openUrl(PRIVACY_URL)}
              />
              <Divider />
              <View style={styles.rowBetween}>
                <Text style={styles.rowLabel}>Versão</Text>
                <Text style={styles.rowValue}>{version}</Text>
              </View>
            </View>
          </View>

          {/* Excluir conta */}
          <TouchableOpacity
            style={[styles.dangerButton, busy && { opacity: 0.6 }]}
            activeOpacity={0.8}
            disabled={busy}
            onPress={handleDeleteAccount}
          >
            {busy ? (
              <ActivityIndicator size="small" color={DANGER} />
            ) : (
              <Text style={styles.dangerText}>Excluir conta</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ------------------------------ estilos ------------------------------ */

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
    justifyContent: "space-between",
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
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    gap: 24,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  rowDesc: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  rowValue: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#2a2a2c",
    borderRadius: 28,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 24,
  },
  segmentText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  dangerButton: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.lg,
    color: DANGER,
    textAlign: "center",
  },
});
