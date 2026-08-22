import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { getRoutePolyline } from "../services/location";
import { theme } from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import PriceSheet from "../components/priceSheet";
import { LocationRecommendation } from "../services/intelligence";

export default function Result() {
  const { originLat, originLon, originName, destLat, destLon, destName } =
    useLocalSearchParams<{
      originLat: string;
      originLon: string;
      originName?: string;
      destLat: string;
      destLon: string;
      destName?: string;
    }>();

  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ponto recomendado — null quando não há recomendação ativa
  const [recommended, setRecommended] = useState<LocationRecommendation | null>(null);

  const webviewRef = useRef<WebView>(null);

  const rawOriginLat = Array.isArray(originLat) ? originLat[0] : originLat;
  const rawOriginLon = Array.isArray(originLon) ? originLon[0] : originLon;
  const rawDestLat = Array.isArray(destLat) ? destLat[0] : destLat;
  const rawDestLon = Array.isArray(destLon) ? destLon[0] : destLon;
  const rawOriginName = Array.isArray(originName) ? originName[0] : originName;
  const rawDestName = Array.isArray(destName) ? destName[0] : destName;

  const oLat = parseFloat(rawOriginLat);
  const oLon = parseFloat(rawOriginLon);
  const dLat = parseFloat(rawDestLat);
  const dLon = parseFloat(rawDestLon);

  useEffect(() => {
    async function fetchRoute() {
      if (!isNaN(oLat) && !isNaN(oLon) && !isNaN(dLat) && !isNaN(dLon)) {
        const route = await getRoutePolyline(
          { lat: oLat, lon: oLon },
          { lat: dLat, lon: dLon },
        );
        setRouteData(route);
      }
      setLoading(false);
    }
    fetchRoute();
  }, [oLat, oLon, dLat, dLon]);

  // Quando o usuário seleciona uma recomendação de localização
  // injeta o ponto no mapa via JavaScript
  const handleSelectRecommendation = (rec: LocationRecommendation) => {
    setRecommended(rec);

    const js = `
      // Remove marcador anterior se existir
      if (window._recMarker) window._recMarker.remove();
      if (window._recLine) {
        map.removeLayer('rec-line');
        map.removeSource('rec-source');
      }

      // Marcador do ponto recomendado — anel verde
      const elRec = document.createElement('div');
      elRec.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#44ffcc;box-shadow:0 0 0 4px rgba(68,255,204,0.25)';
      window._recMarker = new maplibregl.Marker({ element: elRec })
        .setLngLat([${rec.lon}, ${rec.lat}])
        .addTo(map);

      // Linha tracejada da origem até o ponto recomendado
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
          'line-color': '#44ffcc',
          'line-width': 2,
          'line-dasharray': [2, 3],
          'line-opacity': 0.8
        }
      });

      window._recLine = true;

      // Ajusta o mapa para mostrar origem + ponto recomendado
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([${oLon}, ${oLat}]);
      bounds.extend([${rec.lon}, ${rec.lat}]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 16 });

      true;
    `;

    webviewRef.current?.injectJavaScript(js);
  };

  const handleClearRecommendation = () => {
    setRecommended(null);

    const js = `
      if (window._recMarker) window._recMarker.remove();
      if (window._recLine) {
        map.removeLayer('rec-line');
        map.removeSource('rec-source');
        window._recLine = false;
      }
      true;
    `;

    webviewRef.current?.injectJavaScript(js);
  };

  if (isNaN(oLat) || isNaN(oLon) || isNaN(dLat) || isNaN(dLon)) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff", fontFamily: theme.fonts.mono }}>
          Coordenadas inválidas.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#fff" />
        <Text style={{ color: theme.colors.muted, marginTop: 10, fontFamily: theme.fonts.mono }}>
          Calculando rota...
        </Text>
      </View>
    );
  }

  const distanceKm = routeData
    ? (routeData.distance / 1000).toFixed(1) + " km"
    : "--";
  const durationMin = routeData
    ? Math.ceil(routeData.duration / 60) + " min"
    : "--";

  const coordinatesJson = routeData
    ? JSON.stringify(routeData.coordinates)
    : JSON.stringify([[oLon, oLat], [dLon, dLat]]);

  const handleBack = () => {
    router.dismissAll();
    router.replace("/search");
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #121212; }
          #map { width: 100%; height: 100%; }
          .maplibregl-ctrl-top-right { top: 120px !important; }
          .origin-dot { width: 16px; height: 16px; background-color: #ffffff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,0.25); }
          .dest-dot { width: 16px; height: 16px; background-color: #121212; border: 3.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,0.25); }
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

            map.addControl(new maplibregl.NavigationControl());

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

            const bounds = new maplibregl.LngLatBounds();
            routeCoords.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 70, maxZoom: 15 });

          } catch (err) {
            document.body.innerHTML = '<div style="color:white;padding:20px;font-family:monospace;">Erro: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        androidLayerType="hardware"
        mixedContentMode="always"
        allowFileAccess={true}
        startInLoadingState={true}
      />

      <PriceSheet
        originLat={oLat}
        originLon={oLon}
        originName={rawOriginName}
        destLat={dLat}
        destLon={dLon}
        destName={rawDestName}
        onSelectRecommendation={handleSelectRecommendation}
      />

      {/* Header overlay */}
      <View style={styles.overlayContainer}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {recommended ? (
          // Header com dados do ponto recomendado
          <View style={styles.directionHeader}>
            <View style={styles.timeDistanceBox}>
              <Text style={styles.durationText}>
                {recommended.distance_meters}m
              </Text>
              <Text style={styles.distanceText}>
                · economize R$ {recommended.economy.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearRecommendation}>
              <MaterialIcons name="close" size={18} color={theme.colors.muted} />
            </TouchableOpacity>
          </View>
        ) : (
          // Header padrão com tempo e distância da rota
          <View style={styles.directionHeader}>
            <View style={styles.timeDistanceBox}>
              <Text style={styles.durationText}>{durationMin}</Text>
              <Text style={styles.distanceText}>({distanceKm})</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  map: { flex: 1, backgroundColor: "#121212" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 25,
    paddingBottom: 15,
    paddingTop: "18%",
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  directionHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 12,
  },
  timeDistanceBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  durationText: {
    fontFamily: theme.fonts.mono,
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  distanceText: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.md,
    color: theme.colors.muted,
  },
});