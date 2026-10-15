import { theme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const STORAGE_KEY = "@favorite_routes";
const WARN = "#ff8a80";

type Place = { name: string; lat: number; lon: number };

type FavoriteRoute = {
  id: string;
  label: string;
  origin: Place;
  dest: Place;
};

type Draft = { label: string; origin: string; dest: string };

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Converte o texto digitado em coordenadas.
// Se você já tem uma busca de endereços em services/location, troque aqui.
async function resolveAddress(
  text: string,
): Promise<{ lat: number; lon: number } | null> {
  const results = await Location.geocodeAsync(text);
  if (!results.length) return null;
  return { lat: results[0].latitude, lon: results[0].longitude };
}

/* ------------------------------ campo ------------------------------ */

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  returnKeyType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  returnKeyType?: "next" | "done";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        returnKeyType={returnKeyType}
        style={styles.fieldInput}
      />
    </View>
  );
}

/* ------------------------------ modal ------------------------------ */

function RouteModal({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: FavoriteRoute | null;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<boolean>;
}) {
  const insets = useSafeAreaInsets();
  const [label, setLabel] = useState("");
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLabel(initial?.label ?? "");
      setOrigin(initial?.origin.name ?? "");
      setDest(initial?.dest.name ?? "");
      setSaving(false);
    }
  }, [visible, initial]);

  const submit = async () => {
    if (!origin.trim() || !dest.trim()) {
      Alert.alert("Atenção", "Preencha a origem e o destino.");
      return;
    }

    setSaving(true);
    const ok = await onSave({ label, origin, dest });
    setSaving(false);

    if (ok) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          <View style={{ gap: 6, paddingHorizontal: 4 }}>
            <Text style={styles.sheetTitle}>
              {initial ? "Editar atalho" : "Novo atalho"}
            </Text>
            <Text style={styles.sheetDescription}>
              Digite os endereços como faria no mapa. Quanto mais completo,
              melhor a localização.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Field
              label="Nome"
              value={label}
              onChangeText={setLabel}
              placeholder="Ex.: Casa → Trabalho"
              returnKeyType="next"
            />
            <Field
              label="Origem"
              value={origin}
              onChangeText={setOrigin}
              placeholder="Rua, número, bairro"
              returnKeyType="next"
            />
            <Field
              label="Destino"
              value={dest}
              onChangeText={setDest}
              placeholder="Rua, número, bairro"
              returnKeyType="done"
            />
          </View>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              style={[styles.btnPrimary, saving && { opacity: 0.7 }]}
              activeOpacity={0.8}
              disabled={saving}
              onPress={submit}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnPrimaryText}>Salvar atalho</Text>
                  <MaterialIcons name="check" size={22} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              activeOpacity={0.8}
              disabled={saving}
              onPress={onClose}
            >
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ------------------------------- tela ------------------------------- */

export default function FavoriteRoutes() {
  const [routes, setRoutes] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<FavoriteRoute | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) setRoutes(parsed);
      } catch (e) {
        console.error("Erro ao carregar atalhos:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const persist = async (next: FavoriteRoute[]) => {
    setRoutes(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (route: FavoriteRoute) => {
    setEditing(route);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = async (draft: Draft): Promise<boolean> => {
    const originText = draft.origin.trim();
    const destText = draft.dest.trim();

    try {
      // Na edição, reaproveita as coordenadas se o texto não mudou.
      let origin: Place | null =
        editing && editing.origin.name === originText ? editing.origin : null;
      let dest: Place | null =
        editing && editing.dest.name === destText ? editing.dest : null;

      if (!origin) {
        const coords = await resolveAddress(originText);
        if (!coords) {
          Alert.alert(
            "Origem não encontrada",
            "Não encontramos esse endereço. Tente ser mais específico.",
          );
          return false;
        }
        origin = { name: originText, ...coords };
      }

      if (!dest) {
        const coords = await resolveAddress(destText);
        if (!coords) {
          Alert.alert(
            "Destino não encontrado",
            "Não encontramos esse endereço. Tente ser mais específico.",
          );
          return false;
        }
        dest = { name: destText, ...coords };
      }

      const route: FavoriteRoute = {
        id: editing?.id ?? makeId(),
        label: draft.label.trim() || destText,
        origin,
        dest,
      };

      const next = editing
        ? routes.map((r) => (r.id === editing.id ? route : r))
        : [route, ...routes];

      await persist(next);
      return true;
    } catch (e) {
      console.error("Erro ao salvar atalho:", e);
      Alert.alert("Erro", "Não foi possível salvar o atalho.");
      return false;
    }
  };

  const handleDelete = (route: FavoriteRoute) => {
    Alert.alert("Excluir atalho", `Deseja excluir "${route.label}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          persist(routes.filter((r) => r.id !== route.id)).catch((e) =>
            console.error("Erro ao excluir atalho:", e),
          );
        },
      },
    ]);
  };

  const openRoute = (route: FavoriteRoute) => {
    // Ajuste o pathname se a sua tela do mapa tiver outro nome de rota.
    router.push({
      pathname: "/result",
      params: {
        originLat: String(route.origin.lat),
        originLon: String(route.origin.lon),
        originName: route.origin.name,
        destLat: String(route.dest.lat),
        destLon: String(route.dest.lon),
        destName: route.dest.name,
      },
    });
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

        <Text style={styles.headerTitle}>Atalhos de rotas</Text>

        <TouchableOpacity onPress={openAdd} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.text} />
        </View>
      ) : routes.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="shortcut" size={32} color={theme.colors.muted} />
          <Text style={styles.centerTitle}>Nenhum atalho salvo</Text>
          <Text style={styles.centerText}>
            Salve as rotas que você faz com frequência para abrir com um toque.
          </Text>
          <TouchableOpacity style={styles.centerButton} onPress={openAdd}>
            <Text style={styles.centerButtonText}>Adicionar atalho</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <Text style={styles.hint}>
              Toque em um atalho para ver a rota e os preços.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => openRoute(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="shortcut" size={18} color="#fff" />
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.label}
                </Text>

                <TouchableOpacity
                  style={styles.actionButton}
                  hitSlop={8}
                  onPress={() => openEdit(item)}
                >
                  <MaterialIcons name="edit" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  hitSlop={8}
                  onPress={() => handleDelete(item)}
                >
                  <MaterialIcons name="delete-outline" size={18} color={WARN} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.routeRow}>
                <MaterialIcons
                  name="my-location"
                  size={18}
                  color={theme.colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTag}>Origem</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {item.origin.name}
                  </Text>
                </View>
              </View>

              <View style={styles.routeRow}>
                <MaterialIcons
                  name="place"
                  size={18}
                  color={theme.colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTag}>Destino</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {item.dest.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <RouteModal
        visible={modalVisible}
        initial={editing}
        onClose={closeModal}
        onSave={handleSave}
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
  addButton: {
    borderWidth: 1,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  hint: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  /* card */
  card: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 32,
    gap: 16,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeTag: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  routeText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },

  /* modal */
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#0c0c0c",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 20,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3a3a3c",
  },
  sheetTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 22,
    color: theme.colors.text,
  },
  sheetDescription: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 32,
    gap: 10,
  },
  fieldLabel: {
    width: 64,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  fieldInput: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    paddingVertical: 0,
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
  btnSecondary: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 32,
    paddingVertical: 18,
  },
  btnSecondaryText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
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
    backgroundColor: "#1C1C1E",
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
