import Options from "@/components/mainOptions";
import { theme } from "@/constants/theme";
import { getCompleteUserInfo } from "@/services/auth";
import { supabase } from "@/utils/supabase";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT = "#44ffcc";
const CARD_BG = "#1C1C1E";
const ICON_BG = "#2a2a2c";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

type UserInfo = { id: string; name?: string; email?: string };

type Shortcut = {
  id: string;
  label: string;
  origin_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_name: string;
  dest_lat: number;
  dest_lon: number;
};

type RecentRide = {
  id: string;
  created_at: string;
  origin_name: string | null;
  origin_lat: number;
  origin_lon: number;
  dest_name: string | null;
  dest_lat: number;
  dest_lon: number;
  platform_name: string;
  price: number;
  status: string;
};

type MonthRide = {
  price: number;
  economy: number | null;
  used_recommendation: boolean;
  status: string;
};

/* ----------------------------- helpers ----------------------------- */

const money = (n: number) => `R$ ${n.toFixed(2)}`;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const openRoute = (r: {
  originLat: number;
  originLon: number;
  originName?: string | null;
  destLat: number;
  destLon: number;
  destName?: string | null;
}) => {
  // Ajuste o pathname se a sua tela do mapa tiver outro nome de rota.
  router.push({
    pathname: "/result",
    params: {
      originLat: String(r.originLat),
      originLon: String(r.originLon),
      originName: r.originName ?? "",
      destLat: String(r.destLat),
      destLon: String(r.destLon),
      destName: r.destName ?? "",
    },
  });
};

/* --------------------------- componentes --------------------------- */

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function Skeleton({ height }: { height: number }) {
  return <View style={[styles.skeleton, { height }]} />;
}

/* ------------------------------- tela ------------------------------- */

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [recent, setRecent] = useState<RecentRide[]>([]);
  const [monthRides, setMonthRides] = useState<MonthRide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      // A RLS já filtra tudo pelo usuário logado.
      const [info, sc, rc, mo] = await Promise.all([
        getCompleteUserInfo().catch(() => null),
        supabase
          .from("favorite_routes")
          .select(
            "id, label, origin_name, origin_lat, origin_lon, dest_name, dest_lat, dest_lon",
          )
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("rides")
          .select(
            "id, created_at, origin_name, origin_lat, origin_lon, dest_name, dest_lat, dest_lon, platform_name, price, status",
          )
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("rides")
          .select("price, economy, used_recommendation, status")
          .gte("created_at", monthStart.toISOString()),
      ]);

      if (sc.error) throw sc.error;
      if (rc.error) throw rc.error;
      if (mo.error) throw mo.error;

      if (info) setUser(info);

      setShortcuts(
        (sc.data ?? []).map((r: any) => ({
          ...r,
          origin_lat: Number(r.origin_lat),
          origin_lon: Number(r.origin_lon),
          dest_lat: Number(r.dest_lat),
          dest_lon: Number(r.dest_lon),
        })),
      );
      setRecent(
        (rc.data ?? []).map((r: any) => ({
          ...r,
          origin_lat: Number(r.origin_lat),
          origin_lon: Number(r.origin_lon),
          dest_lat: Number(r.dest_lat),
          dest_lon: Number(r.dest_lon),
          price: Number(r.price),
        })),
      );
      setMonthRides(
        (mo.data ?? []).map((r: any) => ({
          price: Number(r.price),
          economy: r.economy === null ? null : Number(r.economy),
          used_recommendation: !!r.used_recommendation,
          status: r.status,
        })),
      );
    } catch (e) {
      console.error("Erro ao carregar a home:", e);
      setError(true);
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, []);

  // Recarrega sempre que a tela ganha foco (ex.: ao voltar do histórico)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const month = useMemo(() => {
    const valid = monthRides.filter((r) => r.status !== "cancelled");
    const total = valid.reduce((s, r) => s + r.price, 0);
    const count = valid.length;
    const savings = valid.reduce(
      (s, r) => (r.used_recommendation && r.economy ? s + r.economy : s),
      0,
    );
    return { total, count, avg: count ? total / count : 0, savings };
  }, [monthRides]);

  const monthName = MONTHS[new Date().getMonth()];
  const firstName = user?.name?.trim().split(" ")[0];
  const initial = firstName ? firstName[0].toUpperCase() : null;

  const goProfile = () =>
    router.push({
      pathname: "/(tabs)/account",
      params: {
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
      },
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.muted}
          />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>Rideless</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              {firstName ? `${greeting()}, ${firstName}` : greeting()}
            </Text>
          </View>

          <TouchableOpacity style={styles.avatar} onPress={goProfile}>
            {initial ? (
              <Text style={styles.avatarText}>{initial}</Text>
            ) : (
              <MaterialIcons name="person" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <TouchableOpacity
          style={styles.search}
          activeOpacity={0.8}
          onPress={() => router.push("/search")}
        >
          <FontAwesome name="search" size={20} color="#9999" />
          <Text style={styles.searchText}>Consultar uma viagem</Text>
        </TouchableOpacity>

        {!loaded ? (
          <>
            <Skeleton height={170} />
            <Skeleton height={120} />
          </>
        ) : (
          <>
            {error && (
              <TouchableOpacity
                style={styles.errorCard}
                activeOpacity={0.8}
                onPress={() => {
                  setLoaded(false);
                  load();
                }}
              >
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color={theme.colors.muted}
                />
                <Text style={[styles.cardSub, { flex: 1 }]}>
                  Não foi possível carregar seus dados.
                </Text>
                <Text style={styles.sectionAction}>Tentar novamente</Text>
              </TouchableOpacity>
            )}

            {/* Resumo do mês */}
            <View style={styles.section}>
              <SectionHeader title={`Resumo de ${monthName}`} />

              {month.count > 0 ? (
                <TouchableOpacity
                  style={styles.bigCard}
                  activeOpacity={0.8}
                  onPress={() => router.push("/RideHistory")}
                >
                  <View style={styles.monthTop}>
                    <View style={{ gap: 4 }}>
                      <Text style={styles.cardSub}>Total gasto</Text>
                      <Text style={styles.monthValue}>
                        {money(month.total)}
                      </Text>
                    </View>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>
                        {month.count}{" "}
                        {month.count === 1 ? "corrida" : "corridas"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.cardSub}>Ticket médio</Text>
                      <Text style={styles.statValue}>{money(month.avg)}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.cardSub}>Economia</Text>
                      <Text style={[styles.statValue, { color: ACCENT }]}>
                        {money(month.savings)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.bigCard, styles.emptyCard]}
                  activeOpacity={0.8}
                  onPress={() => router.push("/search")}
                >
                  <View style={styles.iconCircle}>
                    <MaterialIcons name="local-taxi" size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.cardTitle}>
                      Nenhuma corrida em {monthName}
                    </Text>
                    <Text style={styles.cardSub}>
                      Consulte uma viagem e compare os preços entre Uber e 99.
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Atalhos */}
            <View style={styles.section}>
              <SectionHeader
                title="Atalhos"
                actionLabel={shortcuts.length > 0 ? "Ver todos" : undefined}
                onAction={() => router.push("/(tabs)/FavoriteRides")}
              />

              {shortcuts.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bleed}
                  contentContainerStyle={styles.shortcutRow}
                >
                  {shortcuts.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.shortcutCard}
                      activeOpacity={0.8}
                      onPress={() =>
                        openRoute({
                          originLat: s.origin_lat,
                          originLon: s.origin_lon,
                          originName: s.origin_name,
                          destLat: s.dest_lat,
                          destLon: s.dest_lon,
                          destName: s.dest_name,
                        })
                      }
                    >
                      <View style={styles.iconCircle}>
                        <MaterialIcons name="shortcut" size={18} color="#fff" />
                      </View>
                      <View style={{ gap: 2 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {s.label}
                        </Text>
                        <Text style={styles.cardSub} numberOfLines={1}>
                          Para {s.dest_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[styles.shortcutCard, styles.addCard]}
                    activeOpacity={0.8}
                    onPress={() => router.push("/(tabs)/FavoriteRides")}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="add" size={20} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>Novo atalho</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <TouchableOpacity
                  style={[styles.bigCard, styles.emptyCard]}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(tabs)/FavoriteRides")}
                >
                  <View style={styles.iconCircle}>
                    <MaterialIcons name="add" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.cardTitle}>
                      Crie seu primeiro atalho
                    </Text>
                    <Text style={styles.cardSub}>
                      Salve rotas frequentes, como casa e trabalho, e abra com
                      um toque.
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Corridas recentes */}
            {recent.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Corridas recentes"
                  actionLabel="Ver tudo"
                  onAction={() => router.push("/RideHistory")}
                />

                <View style={{ gap: 12 }}>
                  {recent.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.rideCard}
                      activeOpacity={0.8}
                      onPress={() =>
                        openRoute({
                          originLat: r.origin_lat,
                          originLon: r.origin_lon,
                          originName: r.origin_name,
                          destLat: r.dest_lat,
                          destLon: r.dest_lon,
                          destName: r.dest_name,
                        })
                      }
                    >
                      <View style={styles.iconCircle}>
                        <MaterialIcons name="history" size={18} color="#fff" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {r.dest_name || "Destino"}
                        </Text>
                        <Text style={styles.cardSub} numberOfLines={1}>
                          {r.origin_name ? `De ${r.origin_name}` : "Origem"}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            r.status === "cancelled" && {
                              color: theme.colors.muted,
                              textDecorationLine: "line-through",
                            },
                          ]}
                        >
                          {money(r.price)}
                        </Text>
                        <Text style={styles.cardSub}>{r.platform_name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Mais opções */}
        <View style={styles.section}>
          <SectionHeader title="Mais opções" />
          <Options />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------ estilos ------------------------------ */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 32,
  },

  /* cabeçalho */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: theme.fonts.sansSemiBold,
    color: theme.colors.text,
    fontSize: 34,
  },
  greeting: {
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    fontSize: theme.fontSizes.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "#0c0c0c",
    borderColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },

  /* busca */
  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 32,
    gap: 10,
  },
  searchText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.sans,
    color: "#9999",
  },

  /* seções */
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  sectionLabel: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  sectionAction: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  skeleton: {
    backgroundColor: CARD_BG,
    borderRadius: 32,
    opacity: 0.6,
  },

  /* cards */
  bigCard: {
    backgroundColor: CARD_BG,
    padding: 24,
    borderRadius: 32,
    gap: 20,
  },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  monthTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 34,
    color: theme.colors.text,
  },
  pill: {
    backgroundColor: ICON_BG,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  cardSub: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 32,
  },

  /* atalhos */
  bleed: {
    marginHorizontal: -24,
  },
  shortcutRow: {
    paddingHorizontal: 24,
    gap: 12,
  },
  shortcutCard: {
    width: 210,
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 32,
    gap: 16,
  },
  addCard: {
    width: 150,
    justifyContent: "space-between",
  },

  /* corridas recentes */
  rideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 32,
  },
});
