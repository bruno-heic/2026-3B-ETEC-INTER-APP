import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "../constants/theme";
import {
  getLocationWithAddress,
  searchSuggestions,
  Suggestion,
} from "../services/location";

interface SearchInputProps {
  onOriginSelect: (suggestion: Suggestion) => void;
  onDestSelect: (suggestion: Suggestion) => void;
  lat?: string;
  lon?: string;
}

const SearchInput = ({ onOriginSelect, onDestSelect }: SearchInputProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [originValue, setOriginValue] = useState("");
  const [destValue, setDestValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeField, setActiveField] = useState<"origin" | "dest" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleInput = useCallback((text: string, field: "origin" | "dest") => {
    field === "origin" ? setOriginValue(text) : setDestValue(text);
    setActiveField(field);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchSuggestions(text);
      setSuggestions(results);
      setLoading(false);
    }, 600);
  }, []);

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      if (activeField === "origin") {
        setOriginValue(suggestion.shortName);
        onOriginSelect(suggestion);
      } else if (activeField === "dest") {
        setDestValue(suggestion.shortName);
        onDestSelect(suggestion);
      }
      setSuggestions([]);
      setActiveField(null);
      Keyboard.dismiss();
    },
    [activeField, onOriginSelect, onDestSelect],
  );

  const handleUseLocation = async () => {
    setLoading(true);
    const coords = await getLocationWithAddress();
    setLoading(false);

    if (!coords) return;

    const suggestion: Suggestion = {
      displayName: coords.displayName,
      shortName: coords.shortName,
      lat: coords.lat,
      lon: coords.lon,
    };

    handleSelect(suggestion);
  };

  const handleClear = (field: "origin" | "dest") => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (field === "origin") {
      setOriginValue("");
    } else {
      setDestValue("");
    }
    setSuggestions([]);
    setLoading(false);
  };

  // Tocar fora fecha o teclado e esconde o card
  const handleDismiss = () => {
    Keyboard.dismiss();
    setActiveField(null);
  };

  const activeValue =
    activeField === "origin"
      ? originValue
      : activeField === "dest"
        ? destValue
        : "";

  const hasText = activeValue.length > 0;

  // O card aparece se houver foco (botão de localização) ou texto (sugestões)
  const showList = activeField !== null && (focused || hasText);

  // Sugestões só existem quando há texto digitado
  const showSuggestions = hasText && (loading || suggestions.length > 0);

  return (
    <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
      <View style={styles.container}>
        {/* Card com os dois campos */}
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Endereço de embarque"
              placeholderTextColor="#9999"
              value={originValue}
              onFocus={() => {
                setActiveField("origin");
                setFocused(true);
              }}
              onChangeText={(text) => handleInput(text, "origin")}
              onBlur={() => setFocused(false)}
            />
            {originValue.length > 0 && (
              <TouchableOpacity onPress={() => handleClear("origin")}>
                <MaterialIcons name="close" size={20} color="#9999" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Endereço de destino"
              placeholderTextColor="#9999"
              value={destValue}
              onFocus={() => {
                setActiveField("dest");
                setFocused(true);
              }}
              onChangeText={(text) => handleInput(text, "dest")}
              onBlur={() => setFocused(false)}
            />
            {destValue.length > 0 && (
              <TouchableOpacity onPress={() => handleClear("dest")}>
                <MaterialIcons name="close" size={20} color="#9999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card com localização e sugestões */}
        {showList && (
          <View style={[styles.card, styles.suggestionCard]}>
            {focused && (
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleUseLocation}
              >
                <MaterialIcons
                  name="near-me"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.locationLabel}>Usar localização atual</Text>
              </TouchableOpacity>
            )}

            {focused && showSuggestions && <View style={styles.divider} />}

            {hasText &&
              (loading ? (
                <ActivityIndicator size="small" color={theme.colors.muted} />
              ) : (
                <FlatList
                  data={suggestions}
                  keyExtractor={(_, i) => i.toString()}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.divider} />}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.shortName}
                      </Text>
                      <Text style={styles.suggestionSub} numberOfLines={1}>
                        {item.displayName}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ))}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    gap: 16,
  },
  card: {
    backgroundColor: "#1C1C1E",
    padding: 24,
    borderRadius: 32,
    gap: 24,
  },
  suggestionCard: {
    flexShrink: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: "#353535",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  suggestionItem: {
    paddingVertical: 14,
    gap: 2,
  },
  suggestionText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  suggestionSub: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
});
