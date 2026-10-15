import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export type HistoryPeriod = "7d" | "30d" | "all";

export type AppSettings = {
  confirmBeforeOpen: boolean; // avisa antes de abrir Uber/99
  saveHistory: boolean; // grava a corrida no histórico ao confirmar
  historyPeriod: HistoryPeriod; // filtro inicial do histórico
  showInsights: boolean; // gráficos e estatísticas no histórico
};

export const DEFAULT_SETTINGS: AppSettings = {
  confirmBeforeOpen: false,
  saveHistory: true,
  historyPeriod: "30d",
  showInsights: true,
};

const keyFor = (userId: string) => `@settings:${userId}`;

async function currentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const id = await currentUserId();
    if (!id) return DEFAULT_SETTINGS;

    const raw = await AsyncStorage.getItem(keyFor(id));
    if (!raw) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const id = await currentUserId();
  if (!id) return;
  await AsyncStorage.setItem(keyFor(id), JSON.stringify(settings));
}

export async function clearSettings(userId: string): Promise<void> {
  await AsyncStorage.removeItem(keyFor(userId));
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const latest = useRef<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let ativo = true;

    loadSettings().then((s) => {
      if (!ativo) return;
      latest.current = s;
      setSettings(s);
      setReady(true);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setSettings(next);
    saveSettings(next).catch((e) =>
      console.error("Erro ao salvar configurações:", e),
    );
  }, []);

  return { settings, update, ready };
}
