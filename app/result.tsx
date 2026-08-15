import React, { useEffect, useState } from "react";
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
        <Text
          style={{
            color: theme.colors.muted,
            marginTop: 10,
            fontFamily: theme.fonts.mono,
          }}
        >
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
    : JSON.stringify([
        [oLon, oLat],
        [dLon, dLat],
      ]);

  const handleBack = () => {
    router.back();
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

          /* Marcador Origem: Bola com preenchimento */
          .origin-dot {
            width: 16px;
            height: 16px;
            background-color: #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25);
          }

          /* Marcador Destino: Bola só com borda */
          .dest-dot {
            width: 16px;
            height: 16px;
            background-color: #121212;
            border: 3.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25);
          }
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
                  geometry: {
                    type: 'LineString',
                    coordinates: routeCoords
                  }
                }
              });

              map.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#ffffff',
                  'line-width': 4,
                  'line-opacity': 0.9
                }
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
            document.body.innerHTML = '<div style="color:white;padding:20px;font-family:monospace;">Erro ao carregar mapa: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
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
      />
      <View style={styles.overlayContainer}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.directionHeader}>
          <View style={styles.timeDistanceBox}>
            <Text style={styles.durationText}>{durationMin}</Text>
            <Text style={styles.distanceText}>({distanceKm})</Text>
          </View>
        </View>
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
    paddingInline: 25,
    paddingBottom: 15,
    paddingTop: "18%",
    gap: 12,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  directionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
