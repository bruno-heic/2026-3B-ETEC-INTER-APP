import { theme } from "@/constants/theme";
import { loadSettings } from "@/services/settings";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT = "#44ffcc";
const WARN = "#ff8a80";
const CARD_BG = "#1C1C1E";
const BAR_IDLE = "#2f2f33";
const GRID = "#2a2a2c";
const PALETTE = [
  theme.colors.primary,
  ACCENT,
  "#ffd166",
  "#ff8a80",
  "#a78bfa",
  "#60a5fa",
];

type Ride = {
  id: string;
  created_at: string;
  origin_name: string | null;
  origin_lat: number;
  origin_lon: number;
  dest_name: string | null;
  dest_lat: number;
  dest_lon: number;
  distance_km: number | null;
  duration_min: number | null;
  platform_name: string;
  platform_app: string;
  price: number;
  price_min: number | null;
  price_max: number | null;
  acceptance_probability: number | null;
  used_recommendation: boolean;
  economy: number | null;
  status: "estimated" | "requested" | "completed" | "cancelled";
};

type Section = { title: string; data: Ride[] };
type Period = "7d" | "30d" | "all";
type Bar = { label: string; title: string; value: number };

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "all", label: "Tudo" },
];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const WEEK_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEK_INITIAL = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEK_FULL = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];
const DAYPARTS = ["Madrugada", "Manhã", "Tarde", "Noite"];

const STATUS_LABEL: Record<Ride["status"], string> = {
  estimated: "Estimada",
  requested: "Solicitada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

/* ----------------------------- helpers ----------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const money = (n: number) => `R$ ${n.toFixed(2)}`;

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const monthTitle = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatMinutes = (m: number) => {
  const total = Math.round(m);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return mm === 0 ? `${h} h` : `${h} h ${mm} min`;
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const periodDays = (p: Period) => (p === "7d" ? 7 : p === "30d" ? 30 : 0);

// Início da janela (dias corridos, contando o dia de hoje)
const windowStart = (p: Period): Date | null => {
  const days = periodDays(p);
  if (!days) return null;
  return addDays(startOfToday(), -(days - 1));
};

const inPeriod = (rides: Ride[], p: Period) => {
  const start = windowStart(p);
  if (!start) return rides;
  return rides.filter(
    (r) => new Date(r.created_at).getTime() >= start.getTime(),
  );
};

const previousTotal = (rides: Ride[], p: Period) => {
  const start = windowStart(p);
  const days = periodDays(p);
  if (!start || !days) return 0;
  const prevStart = addDays(start, -days);
  return rides
    .filter((r) => {
      const t = new Date(r.created_at).getTime();
      return (
        r.status !== "cancelled" &&
        t >= prevStart.getTime() &&
        t < start.getTime()
      );
    })
    .reduce((s, r) => s + r.price, 0);
};

function buildBars(rides: Ride[], period: Period): Bar[] {
  const valid = rides.filter((r) => r.status !== "cancelled");

  const sumBetween = (start: Date, end: Date) =>
    valid.reduce((s, r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t < end.getTime() ? s + r.price : s;
    }, 0);

  const today = startOfToday();
  const dm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

  if (period === "7d") {
    return Array.from({ length: 7 }, (_, k) => {
      const start = addDays(today, k - 6);
      const end = addDays(start, 1);
      return {
        label: WEEK_SHORT[start.getDay()],
        title: `${WEEK_SHORT[start.getDay()]}, ${start.getDate()} ${MONTHS_SHORT[start.getMonth()]}`,
        value: sumBetween(start, end),
      };
    });
  }

  if (period === "30d") {
    return Array.from({ length: 5 }, (_, k) => {
      const start = addDays(today, -29 + k * 6);
      const end = addDays(start, 6);
      const last = addDays(end, -1);
      return {
        label: dm(start),
        title: `${dm(start)} – ${dm(last)}`,
        value: sumBetween(start, end),
      };
    });
  }

  return Array.from({ length: 6 }, (_, k) => {
    const start = new Date(today.getFullYear(), today.getMonth() - (5 - k), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return {
      label: MONTHS_SHORT[start.getMonth()],
      title: `${MONTHS[start.getMonth()]} ${start.getFullYear()}`,
      value: sumBetween(start, end),
    };
  });
}

function computeStats(list: Ride[]) {
  const valid = list.filter((r) => r.status !== "cancelled");
  const count = valid.length;
  const total = valid.reduce((s, r) => s + r.price, 0);
  const avg = count ? total / count : 0;

  const totalKm = valid.reduce((s, r) => s + (r.distance_km ?? 0), 0);
  const totalMin = valid.reduce((s, r) => s + (r.duration_min ?? 0), 0);

  const withKm = valid.filter((r) => (r.distance_km ?? 0) > 0);
  const kmSum = withKm.reduce((s, r) => s + (r.distance_km ?? 0), 0);
  const priceOfWithKm = withKm.reduce((s, r) => s + r.price, 0);
  const pricePerKm = kmSum > 0 ? priceOfWithKm / kmSum : null;

  const savings = valid.reduce(
    (s, r) => (r.used_recommendation && r.economy ? s + r.economy : s),
    0,
  );
  const recCount = valid.filter((r) => r.used_recommendation).length;

  const priciest = valid.reduce<Ride | null>(
    (m, r) => (!m || r.price > m.price ? r : m),
    null,
  );

  const platMap = new Map<
    string,
    { name: string; count: number; spent: number }
  >();
  const destMap = new Map<string, number>();
  const weekday: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dayparts: number[] = [0, 0, 0, 0];

  valid.forEach((r) => {
    const p = platMap.get(r.platform_name) ?? {
      name: r.platform_name,
      count: 0,
      spent: 0,
    };
    p.count += 1;
    p.spent += r.price;
    platMap.set(r.platform_name, p);

    if (r.dest_name) {
      destMap.set(r.dest_name, (destMap.get(r.dest_name) ?? 0) + 1);
    }

    const d = new Date(r.created_at);
    weekday[d.getDay()] += 1;
    const h = d.getHours();
    dayparts[h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3] += 1;
  });

  const platforms = Array.from(platMap.values()).sort(
    (a, b) => b.spent - a.spent,
  );
  const topDest =
    Array.from(destMap.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;

  const maxPart = Math.max(...dayparts);
  const topDaypart =
    maxPart > 0
      ? { name: DAYPARTS[dayparts.indexOf(maxPart)], count: maxPart }
      : null;

  return {
    count,
    total,
    avg,
    totalKm,
    totalMin,
    pricePerKm,
    savings,
    recCount,
    priciest,
    platforms,
    topDest,
    weekday,
    topDaypart,
  };
}

type Stats = ReturnType<typeof computeStats>;

/* ----------------------------- gráficos ----------------------------- */

function SpendingBarChart({
  bars,
  selected,
  onSelect,
  width,
}: {
  bars: Bar[];
  selected: number;
  onSelect: (i: number) => void;
  width: number;
}) {
  const n = bars.length;
  const slot = width / n;
  const barWidth = Math.floor(slot * 0.55);
  const spacing = slot - barWidth;
  const max = Math.max(...bars.map((b) => b.value), 0);

  const data = bars.map((b, i) => ({
    value: b.value,
    label: b.label,
    frontColor: i === selected ? theme.colors.primary : BAR_IDLE,
    labelTextStyle: {
      color: i === selected ? theme.colors.text : theme.colors.muted,
      fontSize: 11,
    },
    onPress: () => onSelect(i),
  }));

  return (
    <BarChart
      data={data}
      width={width}
      height={150}
      barWidth={barWidth}
      spacing={spacing}
      initialSpacing={spacing / 2}
      endSpacing={spacing / 2}
      labelWidth={slot}
      barBorderRadius={8}
      noOfSections={3}
      maxValue={max > 0 ? max * 1.15 : 10}
      yAxisThickness={0}
      yAxisLabelWidth={0}
      hideYAxisText
      xAxisColor={GRID}
      rulesColor={GRID}
      isAnimated
      animationDuration={450}
      disableScroll
    />
  );
}

function WeekdayChart({ values, width }: { values: number[]; width: number }) {
  const slot = width / 7;
  const barWidth = Math.floor(slot * 0.55);
  const spacing = slot - barWidth;
  const max = Math.max(...values, 0);

  const data = values.map((v, i) => {
    const isTop = max > 0 && v === max;
    return {
      value: v,
      label: WEEK_INITIAL[i],
      frontColor: isTop ? theme.colors.primary : BAR_IDLE,
      labelTextStyle: {
        color: isTop ? theme.colors.text : theme.colors.muted,
        fontSize: 11,
      },
      topLabelComponent:
        v > 0
          ? () => (
              <Text
                style={[styles.barTop, isTop && { color: theme.colors.text }]}
              >
                {v}
              </Text>
            )
          : undefined,
    };
  });

  return (
    <BarChart
      data={data}
      width={width}
      height={90}
      barWidth={barWidth}
      spacing={spacing}
      initialSpacing={spacing / 2}
      endSpacing={spacing / 2}
      labelWidth={slot}
      barBorderRadius={8}
      noOfSections={2}
      maxValue={max > 0 ? max * 1.4 : 1}
      yAxisThickness={0}
      yAxisLabelWidth={0}
      hideYAxisText
      xAxisColor={GRID}
      hideRules
      isAnimated
      animationDuration={450}
      disableScroll
    />
  );
}

function PlatformDonut({
  platforms,
  total,
}: {
  platforms: Stats["platforms"];
  total: number;
}) {
  const data = platforms.map((p, i) => ({
    value: p.spent,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <View style={{ gap: 24 }}>
      <View style={{ alignItems: "center" }}>
        <PieChart
          data={data}
          donut
          radius={82}
          innerRadius={58}
          innerCircleColor={CARD_BG}
          strokeWidth={3}
          strokeColor={CARD_BG}
          isAnimated
          animationDuration={600}
          centerLabelComponent={() => (
            <View style={styles.donutCenter}>
              <Text style={styles.cardSub}>Total</Text>
              <Text style={styles.donutValue}>{money(total)}</Text>
            </View>
          )}
        />
      </View>

      <View style={{ gap: 16 }}>
        {platforms.map((p, i) => {
          const pct = total > 0 ? (p.spent / total) * 100 : 0;
          return (
            <View key={p.name} style={styles.legendRow}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: PALETTE[i % PALETTE.length] },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.cardSub}>
                  {p.count} {p.count === 1 ? "corrida" : "corridas"} ·{" "}
                  {money(p.spent / p.count)} em média
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.legendName}>{money(p.spent)}</Text>
                <Text style={styles.cardSub}>{pct.toFixed(0)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PriceTrend({ rides, width }: { rides: Ride[]; width: number }) {
  const points = rides
    .filter((r) => r.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .slice(-12);

  if (points.length < 2) return null;

  const values = points.map((p) => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;

  const edge = 12;
  const spacing = (width - edge * 2) / (points.length - 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabelFlat}>Preço das últimas corridas</Text>
      <View style={styles.bigCard}>
        <LineChart
          data={values.map((value) => ({ value }))}
          width={width}
          height={130}
          areaChart
          curved
          color={theme.colors.primary}
          thickness={3}
          startFillColor={theme.colors.primary}
          endFillColor={theme.colors.primary}
          startOpacity={0.35}
          endOpacity={0.02}
          dataPointsColor={theme.colors.primary}
          dataPointsRadius={3}
          spacing={spacing}
          initialSpacing={edge}
          endSpacing={edge}
          noOfSections={3}
          maxValue={max * 1.2}
          yAxisThickness={0}
          yAxisLabelWidth={0}
          hideYAxisText
          xAxisThickness={0}
          rulesColor={GRID}
          showReferenceLine1
          referenceLine1Position={avg}
          referenceLine1Config={{
            color: "#5a5a5e",
            dashWidth: 4,
            dashGap: 4,
          }}
          isAnimated
          animationDuration={600}
          disableScroll
        />
        <View style={styles.trendFooter}>
          <View>
            <Text style={styles.cardSub}>Mínimo</Text>
            <Text style={styles.trendValue}>{money(min)}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.cardSub}>Média</Text>
            <Text style={styles.trendValue}>{money(avg)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.cardSub}>Máximo</Text>
            <Text style={styles.trendValue}>{money(max)}</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>
          Da mais antiga para a mais recente (até 12 corridas).
        </Text>
      </View>
    </View>
  );
}

/* --------------------------- componentes --------------------------- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  width,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  width: number;
}) {
  return (
    <View style={[styles.statCard, { width }]}>
      <View style={styles.statIcon}>
        <MaterialIcons name={icon} size={18} color={color ?? "#fff"} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, color ? { color } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {sub ? (
        <Text style={styles.statSub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function RideCard({
  ride,
  expanded,
  onToggle,
  onRepeat,
}: {
  ride: Ride;
  expanded: boolean;
  onToggle: () => void;
  onRepeat: () => void;
}) {
  const cancelled = ride.status === "cancelled";
  const highlightStatus =
    ride.status === "completed" || ride.status === "requested";

  const range =
    ride.price_min !== null && ride.price_max !== null
      ? `${money(ride.price_min)} – ${money(ride.price_max)}`
      : "--";

  const acceptance =
    ride.acceptance_probability !== null
      ? `${(ride.acceptance_probability * 100).toFixed(0)}%`
      : "--";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onToggle}
    >
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="local-taxi" size={18} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {ride.dest_name || "Destino"}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {ride.origin_name ? `De ${ride.origin_name}` : "Origem"}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text
            style={[
              styles.cardPrice,
              cancelled && {
                color: theme.colors.muted,
                textDecorationLine: "line-through",
              },
            ]}
          >
            {money(ride.price)}
          </Text>
          <Text style={styles.cardSub}>{ride.platform_name}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.cardSub}>{formatDateTime(ride.created_at)}</Text>
        <View style={styles.chip}>
          <Text
            style={[
              styles.chipText,
              highlightStatus && { color: theme.colors.primary },
            ]}
          >
            {STATUS_LABEL[ride.status]}
          </Text>
        </View>
      </View>

      {ride.used_recommendation &&
        ride.economy !== null &&
        ride.economy > 0 && (
          <View style={styles.economyRow}>
            <MaterialIcons name="savings" size={16} color={ACCENT} />
            <Text style={styles.economyText}>
              Economizou {money(ride.economy)}
            </Text>
          </View>
        )}

      {expanded && (
        <View style={styles.details}>
          <View style={styles.divider} />
          <DetailRow
            label="Distância"
            value={
              ride.distance_km !== null
                ? `${ride.distance_km.toFixed(1)} km`
                : "--"
            }
          />
          <DetailRow
            label="Duração"
            value={
              ride.duration_min !== null
                ? `${Math.round(ride.duration_min)} min`
                : "--"
            }
          />
          <DetailRow label="Faixa estimada" value={range} />
          <DetailRow label="Prob. de aceitação" value={acceptance} />

          <TouchableOpacity
            style={styles.repeatButton}
            activeOpacity={0.8}
            onPress={onRepeat}
          >
            <MaterialIcons name="replay" size={20} color="#fff" />
            <Text style={styles.repeatText}>Pedir novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function Insights({
  stats,
  bars,
  period,
  filtered,
  selectedBar,
  onSelectBar,
}: {
  stats: Stats;
  bars: Bar[];
  period: Period;
  filtered: Ride[];
  selectedBar: number | null;
  onSelectBar: (i: number) => void;
}) {
  const { width } = useWindowDimensions();
  // tela (24 + 24) menos o padding interno do card (24 + 24)
  const chartWidth = width - 96;
  const cardWidth = (width - 48 - 12) / 2;

  const effective = selectedBar ?? bars.length - 1;
  const current = bars[effective];

  const chartTitle =
    period === "7d"
      ? "Gastos por dia"
      : period === "30d"
        ? "Gastos a cada 6 dias"
        : "Gastos por mês";

  const days = periodDays(period);
  const maxWeekday = Math.max(...stats.weekday, 0);
  const topWeekday = maxWeekday > 0 ? stats.weekday.indexOf(maxWeekday) : -1;

  return (
    <View style={{ gap: 24, marginBottom: 8 }}>
      {/* Gastos */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelFlat}>{chartTitle}</Text>
        <View style={styles.bigCard}>
          <View style={{ gap: 2 }}>
            <Text style={styles.cardSub}>{current?.title}</Text>
            <Text style={styles.chartValue}>{money(current?.value ?? 0)}</Text>
          </View>
          <SpendingBarChart
            bars={bars}
            selected={effective}
            onSelect={onSelectBar}
            width={chartWidth}
          />
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelFlat}>Resumo</Text>
        <View style={styles.statGrid}>
          <StatCard
            width={cardWidth}
            icon="attach-money"
            label="Ticket médio"
            value={money(stats.avg)}
            sub={days ? `nos últimos ${days} dias` : "em todas as corridas"}
          />
          <StatCard
            width={cardWidth}
            icon="speed"
            label="Preço por km"
            value={
              stats.pricePerKm !== null
                ? `R$ ${stats.pricePerKm.toFixed(2)}`
                : "--"
            }
            sub="média das corridas"
          />
          <StatCard
            width={cardWidth}
            icon="straighten"
            label="Distância total"
            value={`${stats.totalKm.toFixed(1)} km`}
          />
          <StatCard
            width={cardWidth}
            icon="schedule"
            label="Tempo em corridas"
            value={stats.totalMin > 0 ? formatMinutes(stats.totalMin) : "--"}
          />
          <StatCard
            width={cardWidth}
            icon="savings"
            label="Economia total"
            value={money(stats.savings)}
            sub={`${stats.recCount} de ${stats.count} com recomendação`}
            color={ACCENT}
          />
          <StatCard
            width={cardWidth}
            icon="trending-up"
            label="Corrida mais cara"
            value={stats.priciest ? money(stats.priciest.price) : "--"}
            sub={stats.priciest?.dest_name ?? undefined}
          />
          <StatCard
            width={cardWidth}
            icon="place"
            label="Destino frequente"
            value={stats.topDest ? stats.topDest[0] : "--"}
            sub={stats.topDest ? `${stats.topDest[1]}x` : undefined}
          />
          <StatCard
            width={cardWidth}
            icon="access-time"
            label="Horário comum"
            value={stats.topDaypart ? stats.topDaypart.name : "--"}
            sub={
              stats.topDaypart
                ? `${stats.topDaypart.count} ${stats.topDaypart.count === 1 ? "corrida" : "corridas"}`
                : undefined
            }
          />
        </View>
      </View>

      {/* Plataformas */}
      {stats.platforms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabelFlat}>Gastos por plataforma</Text>
          <View style={styles.bigCard}>
            <PlatformDonut platforms={stats.platforms} total={stats.total} />
          </View>
        </View>
      )}

      {/* Tendência de preço */}
      <PriceTrend rides={filtered} width={chartWidth} />

      {/* Dias da semana */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelFlat}>Corridas por dia da semana</Text>
        <View style={styles.bigCard}>
          <Text style={styles.cardSub}>
            {topWeekday >= 0
              ? `Dia mais frequente: ${WEEK_FULL[topWeekday]} (${maxWeekday} ${maxWeekday === 1 ? "corrida" : "corridas"})`
              : "Sem dados"}
          </Text>
          <WeekdayChart values={stats.weekday} width={chartWidth} />
        </View>
      </View>
    </View>
  );
}

/* ------------------------------- tela ------------------------------- */

export default function RideHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  const fetchRides = useCallback(async () => {
    try {
      setError(false);

      // A RLS já filtra pelas corridas do usuário logado.
      const { data, error: err } = await supabase
        .from("rides")
        .select(
          "id, created_at, origin_name, origin_lat, origin_lon, dest_name, dest_lat, dest_lon, distance_km, duration_min, platform_name, platform_app, price, price_min, price_max, acceptance_probability, used_recommendation, economy, status",
        )
        .order("created_at", { ascending: false })
        .limit(500);

      if (err) throw err;

      const parsed: Ride[] = (data ?? []).map((r: any) => ({
        ...r,
        origin_lat: Number(r.origin_lat),
        origin_lon: Number(r.origin_lon),
        dest_lat: Number(r.dest_lat),
        dest_lon: Number(r.dest_lon),
        distance_km: num(r.distance_km),
        duration_min: num(r.duration_min),
        price: Number(r.price),
        price_min: num(r.price_min),
        price_max: num(r.price_max),
        acceptance_probability: num(r.acceptance_probability),
        economy: num(r.economy),
      }));

      setRides(parsed);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettings().then((s) => {
      setPeriod(s.historyPeriod);
      setShowInsights(s.showInsights);
    });
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const handleChangePeriod = (p: Period) => {
    setPeriod(p);
    setSelectedBar(null);
    setExpandedId(null);
  };

  const filtered = useMemo(() => inPeriod(rides, period), [rides, period]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const bars = useMemo(() => buildBars(rides, period), [rides, period]);

  const delta = useMemo(() => {
    const prev = previousTotal(rides, period);
    if (prev <= 0) return null;
    return ((stats.total - prev) / prev) * 100;
  }, [rides, period, stats.total]);

  const sections = useMemo<Section[]>(() => {
    const map = new Map<string, Ride[]>();
    filtered.forEach((r) => {
      const key = monthTitle(r.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map, ([title, data]) => ({ title, data }));
  }, [filtered]);

  const handleRepeat = (ride: Ride) => {
    // Ajuste o pathname se a sua tela do mapa tiver outro nome de rota.
    router.push({
      pathname: "/result",
      params: {
        originLat: String(ride.origin_lat),
        originLon: String(ride.origin_lon),
        originName: ride.origin_name ?? "",
        destLat: String(ride.dest_lat),
        destLon: String(ride.dest_lon),
        destName: ride.dest_name ?? "",
      },
    });
  };

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.circleButton}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Histórico</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.text} />
          <Text style={styles.centerText}>Carregando corridas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <View style={styles.center}>
          <MaterialIcons
            name="error-outline"
            size={32}
            color={theme.colors.muted}
          />
          <Text style={styles.centerTitle}>Não foi possível carregar</Text>
          <Text style={styles.centerText}>
            Verifique sua conexão e tente novamente.
          </Text>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              setLoading(true);
              fetchRides();
            }}
          >
            <Text style={styles.centerButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (rides.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <View style={styles.center}>
          <MaterialIcons name="history" size={32} color={theme.colors.muted} />
          <Text style={styles.centerTitle}>Nenhuma corrida ainda</Text>
          <Text style={styles.centerText}>
            As corridas que você confirmar vão aparecer aqui.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const days = periodDays(period);

  const ListTop = (
    <View style={{ gap: 24 }}>
      {/* Filtro de período */}
      <View style={styles.segment}>
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.segmentItem,
                active && { backgroundColor: theme.colors.primary },
              ]}
              activeOpacity={0.8}
              onPress={() => handleChangePeriod(p.key)}
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

      {/* Resumo */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total gasto</Text>
        <Text style={styles.heroPrice}>{money(stats.total)}</Text>
        <Text style={styles.heroLabel}>
          {stats.count} {stats.count === 1 ? "corrida" : "corridas"}
        </Text>
        {delta !== null && (
          <Text
            style={[styles.heroDelta, { color: delta > 0 ? WARN : ACCENT }]}
          >
            {delta > 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(0)}% vs. {days}{" "}
            dias anteriores
          </Text>
        )}
      </View>

      {stats.count > 0 && showInsights ? (
        <Insights
          stats={stats}
          bars={bars}
          period={period}
          filtered={filtered}
          selectedBar={selectedBar}
          onSelectBar={setSelectedBar}
        />
      ) : null}

      {filtered.length > 0 && (
        <Text style={[styles.sectionLabelFlat, { marginBottom: -16 }]}>
          Corridas
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {Header}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.muted}
          />
        }
        ListHeaderComponent={ListTop}
        ListEmptyComponent={
          <View style={styles.emptyPeriod}>
            <MaterialIcons
              name="history"
              size={28}
              color={theme.colors.muted}
            />
            <Text style={styles.centerText}>
              Nenhuma corrida neste período.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionLabel}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            expanded={expandedId === item.id}
            onToggle={() =>
              setExpandedId((cur) => (cur === item.id ? null : item.id))
            }
            onRepeat={() => handleRepeat(item)}
          />
        )}
        SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
  listContent: {
    paddingBottom: 32,
  },

  /* período */
  segment: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
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

  /* hero */
  hero: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  heroLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  heroPrice: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 44,
    color: theme.colors.text,
    marginTop: 4,
  },
  heroDelta: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
    marginTop: 4,
  },

  /* seções */
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabelFlat: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    paddingHorizontal: 12,
  },
  bigCard: {
    backgroundColor: CARD_BG,
    padding: 24,
    borderRadius: 32,
    gap: 20,
    overflow: "hidden",
  },

  /* gráficos */
  chartValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 28,
    color: theme.colors.text,
  },
  barTop: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  donutCenter: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  donutValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  trendFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },

  /* estatísticas */
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 18,
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GRID,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  statValue: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  statSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.muted,
  },

  /* cards de corrida */
  card: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 32,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GRID,
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
  cardRight: {
    alignItems: "flex-end",
  },
  cardPrice: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    backgroundColor: GRID,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chipText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  economyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  economyText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.sm,
    color: ACCENT,
  },
  details: {
    gap: 16,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
  detailValue: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  repeatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 32,
    paddingVertical: 14,
    marginTop: 4,
  },
  repeatText: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: "#fff",
  },

  /* estados */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  emptyPeriod: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  centerTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    textAlign: "center",
  },
  centerText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    textAlign: "center",
  },
  centerButton: {
    backgroundColor: CARD_BG,
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  centerButtonText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
});
