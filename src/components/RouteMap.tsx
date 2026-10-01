import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { C } from "../theme";
import { LEAFLET_CSS, LEAFLET_JS } from "./leafletAsset";

const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>${LEAFLET_CSS}
html,body,#m{height:100%;margin:0;background:#DCE6D8}
.leaflet-control-attribution{font-size:9px;background:rgba(251,252,249,.75)!important}
.leaflet-control-zoom{display:none}
</style></head><body><div id="m"></div>
<script>${LEAFLET_JS}</script>
<script>
var map = L.map('m', { zoomControl: false, attributionControl: true }).setView([11.0168, 76.9558], 15);
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
});
var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19, attribution: '&copy; Esri, OpenStreetMap contributors'
});
var tileErrors = 0;
osm.on('tileerror', function(){
  tileErrors++;
  if (tileErrors === 3) { map.removeLayer(osm); esri.addTo(map); }
});
osm.addTo(map);
var line = L.polyline([], { color: '#3F7A56', weight: 5, lineCap: 'round', lineJoin: 'round' }).addTo(map);
var start = null, cur = null, halo = null, userMoved = false, lastN = 0;
map.on('dragstart', function(){ userMoved = true; });
window.setRoute = function(pts, follow) {
  line.setLatLngs(pts);
  if (!pts.length) {
    [start, cur, halo].forEach(function(x){ if (x) map.removeLayer(x); });
    start = cur = halo = null; userMoved = false; lastN = 0;
    return;
  }
  var a = pts[0], b = pts[pts.length - 1];
  if (!start) start = L.circleMarker(a, { radius: 6, color: '#1D3530', weight: 3, fillColor: '#FBFCF9', fillOpacity: 1 }).addTo(map);
  else start.setLatLng(a);
  if (follow) {
    if (!halo) halo = L.circleMarker(b, { radius: 14, stroke: false, fillColor: '#E3A21A', fillOpacity: .25 }).addTo(map);
    if (!cur) cur = L.circleMarker(b, { radius: 7, color: '#FBFCF9', weight: 3, fillColor: '#E3A21A', fillOpacity: 1 }).addTo(map);
    halo.setLatLng(b); cur.setLatLng(b);
    if (!userMoved) map.setView(b, Math.max(map.getZoom(), 16), { animate: pts.length !== lastN });
  } else {
    if (cur) { map.removeLayer(cur); map.removeLayer(halo); cur = halo = null; }
    if (pts.length > 1) map.fitBounds(line.getBounds(), { padding: [24, 24] });
    else map.setView(a, 16);
  }
  lastN = pts.length;
};
window.recenter = function(){ userMoved = false; };
var here = null;
window.showHere = function(lat, lng){
  if (!here) here = L.circleMarker([lat, lng], { radius: 7, color: '#FBFCF9', weight: 3, fillColor: '#3F7A56', fillOpacity: 1 }).addTo(map);
  else here.setLatLng([lat, lng]);
  map.setView([lat, lng], 16);
};
window.hideHere = function(){ if (here) { map.removeLayer(here); here = null; } };
</script></body></html>`;

export default function RouteMap({ route, follow, style, recenterKey, here }: {
  route: [number, number][]; follow?: boolean; style?: ViewStyle; recenterKey?: number; here?: [number, number] | null;
}) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const source = useMemo(() => ({ html: HTML, baseUrl: "https://fitfaaz.local/" }), []);
  const payload = JSON.stringify(route);

  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.setRoute(${payload}, ${!!follow}); true;`);
  }, [ready, payload, follow]);
  useEffect(() => {
    if (!ready) return;
    ref.current?.injectJavaScript(here && !route.length ? `window.showHere(${here[0]}, ${here[1]}); true;` : "window.hideHere(); true;");
  }, [ready, here?.[0], here?.[1], route.length > 0]);
  useEffect(() => {
    if (ready && recenterKey) ref.current?.injectJavaScript(`window.recenter(); window.setRoute(${payload}, ${!!follow}); true;`);
  }, [recenterKey]);

  return (
    <View style={[{ borderRadius: 22, overflow: "hidden", backgroundColor: "#DCE6D8", borderWidth: 1, borderColor: C.line }, style]}>
      <WebView
        ref={ref}
        source={source}
        originWhitelist={["*"]}
        onLoadEnd={() => setReady(true)}
        javaScriptEnabled
        scrollEnabled={false}
        overScrollMode="never"
        nestedScrollEnabled
        setBuiltInZoomControls={false}
        style={{ flex: 1, backgroundColor: "#DCE6D8" }}
      />
    </View>
  );
}
