import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import PriceSheet from "../components/priceSheet";
import { theme } from "../constants/theme";
import { LocationRecommendation } from "../services/intelligence";
import { getRoutePolyline } from "../services/location";

const ACCENT = "#44ffcc";

const toStr = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function Result() {
  const params = useLocalSearchParams<{
    originLat: string;
    originLon: string;
    originName?: string;
    destLat: string;
    destLon: string;
    destName?: string;
  }>();

  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<LocationRecommendation | null>(
    null,
  );

  const oLat = parseFloat(toStr(params.originLat));
  const oLon = parseFloat(toStr(params.originLon));
  const dLat = parseFloat(toStr(params.destLat));
  const dLon = parseFloat(toStr(params.destLon));
  const originName = toStr(params.originName) || undefined;
  const destName = toStr(params.destName) || undefined;

  const validCoords = [oLat, oLon, dLat, dLon].every(Number.isFinite);

  // Posição dos elementos flutuantes
  const headerTop = insets.top + 8;
  const mapControlsTop = headerTop + 48 + 12;

  useEffect(() => {
    if (!validCoords) {
      setLoading(false);
      return;
    }

    let ativo = true;

    async function fetchRoute() {
      try {
        const route = await getRoutePolyline(
          { lat: oLat, lon: oLon },
          { lat: dLat, lon: dLon },
        );
        if (ativo) setRouteData(route);
      } catch {
        if (ativo) setRouteData(null);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    fetchRoute();

    return () => {
      ativo = false;
    };
  }, [oLat, oLon, dLat, dLon, validCoords]);

  const coordinatesJson = useMemo(
    () =>
      JSON.stringify(
        routeData?.coordinates ?? [
          [oLon, oLat],
          [dLon, dLat],
        ],
      ),
    [routeData, oLat, oLon, dLat, dLon],
  );

  const mapHtml = useMemo(() => {
    if (!validCoords) return "";

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; }
          #map { width: 100%; height: 100%; }
          .maplibregl-ctrl-top-right { top: ${mapControlsTop}px !important; right: 12px !important; }
          .maplibregl-ctrl-group { background: #1C1C1E !important; border-radius: 24px !important; overflow: hidden; box-shadow: none !important; border: 1px solid #1f1f1f; }
          .maplibregl-ctrl-group button { width: 40px; height: 40px; background-color: transparent !important; }
          .maplibregl-ctrl-group button + button { border-top: 1px solid #353535 !important; }
          .maplibregl-ctrl-icon { filter: invert(1); }
          .origin-dot { width: 16px; height: 16px; background-color: #ffffff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,0.25); }
          .dest-dot { width: 16px; height: 16px; background-color: #000; border: 3.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,0.25); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            const origin = [${oLon}, ${oLat}];
            const destination = [${dLon}, ${dLat}];
            const routeCoords = ${coordinatesJson};

            const map = new maplibregl.Map({
              container: 'map',
              style: 'https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
              center: origin,
              zoom: 14
            });

            // Fica acessível para os scripts injetados pelo React Native
            window._map = map;

            map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

            map.on('load', () => {
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: { type: 'LineString', coordinates: routeCoords }
                }
              });
              map.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#ffffff', 'line-width': 4, 'line-opacity': 0.9 }
              });
            });

            const elOrigin = document.createElement('div');
            elOrigin.className = 'origin-dot';
            new maplibregl.Marker({ element: elOrigin }).setLngLat(origin).addTo(map);

            const elDest = document.createElement('div');
            elDest.className = 'dest-dot';
            new maplibregl.Marker({ element: elDest }).setLngLat(destination).addTo(map);

            // Deixa espaço para o cabeçalho (topo) e para a sheet (base)
            window._padding = { top: ${mapControlsTop + 20}, bottom: 360, left: 50, right: 50 };

            const bounds = new maplibregl.LngLatBounds();
            routeCoords.forEach(coord => bounds.extend(coord));
            window._routeBounds = bounds;
            map.fitBounds(bounds, { padding: window._padding, maxZoom: 15, duration: 0 });

          } catch (err) {
            document.body.innerHTML = '<div style="color:white;padding:20px;font-family:sans-serif;">Erro: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;
  }, [validCoords, oLat, oLon, dLat, dLon, coordinatesJson, mapControlsTop]);

  const handleSelectRecommendation = (rec: LocationRecommendation) => {
    setRecommended(rec);

    // IIFE: evita erro de "const já declarada" quando o script roda mais de uma vez
    const js = `
      (function () {
        var map = window._map;
        if (!map) return;

        if (window._recMarker) { window._recMarker.remove(); window._recMarker = null; }
        if (map.getLayer('rec-line')) map.removeLayer('rec-line');
        if (map.getSource('rec-source')) map.removeSource('rec-source');

        var elRec = document.createElement('div');
        elRec.style.cssText = 'width:16px;height:16px;border-radius:50%;background:${ACCENT};box-shadow:0 0 0 4px rgba(68,255,204,0.25)';
        window._recMarker = new maplibregl.Marker({ element: elRec })
          .setLngLat([${rec.lon}, ${rec.lat}])
          .addTo(map);

        map.addSource('rec-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[${oLon}, ${oLat}], [${rec.lon}, ${rec.lat}]]
            }
          }
        });

        map.addLayer({
          id: 'rec-line',
          type: 'line',
          source: 'rec-source',
          paint: {
            'line-color': '${ACCENT}',
            'line-width': 2,
            'line-dasharray': [2, 3],
            'line-opacity': 0.8
          }
        });

        var bounds = new maplibregl.LngLatBounds();
        bounds.extend([${oLon}, ${oLat}]);
        bounds.extend([${rec.lon}, ${rec.lat}]);
        map.fitBounds(bounds, { padding: window._padding, maxZoom: 16 });
      })();
      true;
    `;

    webviewRef.current?.injectJavaScript(js);
  };

  const handleClearRecommendation = () => {
    setRecommended(null);

    const js = `
      (function () {
        var map = window._map;
        if (!map) return;

        if (window._recMarker) { window._recMarker.remove(); window._recMarker = null; }
        if (map.getLayer('rec-line')) map.removeLayer('rec-line');
        if (map.getSource('rec-source')) map.removeSource('rec-source');

        if (window._routeBounds) {
          map.fitBounds(window._routeBounds, { padding: window._padding, maxZoom: 15 });
        }
      })();
      true;
    `;

    webviewRef.current?.injectJavaScript(js);
  };

  const handleBack = () => {
    router.back();
  };

  if (!validCoords) {
    return (
      <View style={styles.center}>
        <MaterialIcons
          name="error-outline"
          size={32}
          color={theme.colors.muted}
        />
        <Text style={styles.centerTitle}>Coordenadas inválidas</Text>
        <TouchableOpacity style={styles.centerButton} onPress={handleBack}>
          <Text style={styles.centerButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={theme.colors.text} />
        <Text style={styles.centerText}>Calculando rota...</Text>
      </View>
    );
  }

  const distanceKm = routeData
    ? (routeData.distance / 1000).toFixed(1) + " km"
    : "--";
  const durationMin = routeData
    ? Math.ceil(routeData.duration / 60) + " min"
    : "--";

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        mixedContentMode="always"
        allowFileAccess
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.center, StyleSheet.absoluteFill]}>
            <ActivityIndicator size="small" color={theme.colors.text} />
          </View>
        )}
      />

      <PriceSheet
        originLat={oLat}
        originLon={oLon}
        originName={originName}
        destLat={dLat}
        destLon={dLon}
        destName={destName}
        onSelectRecommendation={handleSelectRecommendation}
      />

      {/* Cabeçalho flutuante */}
      <View style={[styles.header, { top: headerTop }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.circleButton}
          hitSlop={8}
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.pill}>
          {recommended ? (
            <>
              <View style={styles.pillInfo}>
                <MaterialIcons
                  name="directions-walk"
                  size={20}
                  color={ACCENT}
                />
                <Text style={[styles.pillTitle, { color: ACCENT }]}>
                  {recommended.distance_meters} m
                </Text>
                <Text style={styles.pillSub} numberOfLines={1}>
                  economize R$ {recommended.economy.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClearRecommendation}
                hitSlop={10}
              >
                <MaterialIcons
                  name="close"
                  size={18}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.pillInfo}>
              <Text style={styles.pillTitle}>{durationMin}</Text>
              <Text style={styles.pillSub}>{distanceKm}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    gap: 12,
    paddingHorizontal: 24,
  },
  centerTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  centerText: {
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
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
  header: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "#0c0c0c",
    borderColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "#0c0c0c",
    borderColor: "#1f1f1f",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  pillTitle: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  pillSub: {
    flexShrink: 1,
    fontFamily: theme.fonts.sans,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.muted,
  },
});
