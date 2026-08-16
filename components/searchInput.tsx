import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { theme } from "../constants/theme";
import {
  searchSuggestions,
  getLocationWithAddress,
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

  const handleInput = useCallback((text: string, field: "origin" | "dest") => {
    field === "origin" ? setOriginValue(text) : setDestValue(text);
    setActiveField(field);

    if (text.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
    if (field === "origin") {
      setOriginValue("");
    } else {
      setDestValue("");
    }
    setSuggestions([]);
  };

  const showList = activeField !== null;

  return (
    <View style={styles.container}>
      <View style={styles.inputBlock}>
        <View style={styles.inputRow}>
          <View style={styles.dotOrigin} />
          <TextInput
            style={styles.input}
            placeholder="Endereço de embarque"
            placeholderTextColor={theme.colors.muted}
            value={originValue}
            onFocus={() => setActiveField("origin")}
            onChangeText={(text) => handleInput(text, "origin")}
          />
          {originValue.length > 0 && (
            <TouchableOpacity onPress={() => handleClear("origin")}>
              <MaterialIcons
                name="close"
                size={20}
                color={theme.colors.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.inputRow, { borderTopWidth: 0 }]}>
          <View style={styles.dotDest} />
          <TextInput
            style={styles.input}
            placeholder="Endereço de destino"
            placeholderTextColor={theme.colors.muted}
            value={destValue}
            onFocus={() => setActiveField("dest")}
            onChangeText={(text) => handleInput(text, "dest")}
          />
          {destValue.length > 0 && (
            <TouchableOpacity onPress={() => handleClear("dest")}>
              <MaterialIcons
                name="close"
                size={20}
                color={theme.colors.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showList && (
        <View style={styles.suggestionList}>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={handleUseLocation}
          >
            <MaterialIcons name="near-me" size={16} color={theme.colors.text} />
            <View>
              <Text style={styles.locationLabel}>Usar localização atual</Text>
            </View>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.muted}
              style={{ paddingVertical: 16 }}
            />
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(_, i) => i.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.suggestionText}>{item.shortName}</Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  inputBlock: {},
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 20,
    borderColor: theme.colors.border,
  },
  dotOrigin: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.text,
  },
  dotDest: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  suggestionList: {
    marginTop: 10,
    flex: 1,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
  },
  locationLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  suggestionItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  suggestionSub: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
    marginTop: 2,
  },
});
