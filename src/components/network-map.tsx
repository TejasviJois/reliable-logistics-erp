"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Trip } from "@/types";

const CITY_COORDS: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867],
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Delhi: [28.6139, 77.209],
  Mysuru: [12.2958, 76.6394],
  Coimbatore: [11.0168, 76.9558],
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function NetworkMap({
  trips,
  selectedId,
  onSelect,
}: {
  trips: Trip[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const bounds = useMemo(() => {
    const pts: [number, number][] = [];
    trips.forEach((t) => {
      const o = CITY_COORDS[t.origin];
      const d = CITY_COORDS[t.destination];
      if (o) pts.push(o);
      if (d) pts.push(d);
      if (t.lat && t.lng) pts.push([t.lat, t.lng]);
    });
    return pts.length ? L.latLngBounds(pts) : L.latLngBounds([[12.5, 76], [19.5, 81]]);
  }, [trips]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([15.5, 77.5], 6);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    trips.forEach((t) => {
      const origin = CITY_COORDS[t.origin] ?? [t.lat, t.lng];
      const dest = CITY_COORDS[t.destination] ?? [t.lat, t.lng];
      const progress = Math.min(100, Math.max(0, t.progressPct)) / 100;
      const pos: [number, number] = [
        lerp(origin[0], dest[0], progress),
        lerp(origin[1], dest[1], progress),
      ];
      const active = t.id === selectedId;

      L.polyline([origin, dest], {
        color: active ? "#e31e24" : "#94a3b8",
        weight: active ? 3 : 1.5,
        opacity: active ? 0.9 : 0.55,
        dashArray: active ? undefined : "6 6",
      }).addTo(layer);

      L.circleMarker(origin, {
        radius: 5,
        color: "#fff",
        weight: 1,
        fillColor: "#e31e24",
        fillOpacity: 1,
      }).addTo(layer);

      L.circleMarker(dest, {
        radius: 5,
        color: "#fff",
        weight: 1,
        fillColor: "#4b65af",
        fillOpacity: 1,
      }).addTo(layer);

      const marker = L.circleMarker(pos, {
        radius: active ? 9 : 7,
        color: "#fff",
        weight: 2,
        fillColor: active ? "#e31e24" : "#4b65af",
        fillOpacity: 1,
      })
        .bindTooltip(`${t.code} · ${t.progressPct}%`, {
          direction: "top",
          offset: [0, -8],
        })
        .on("click", () => onSelect(t.id))
        .addTo(layer);

      if (active) {
        marker.openTooltip();
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.25));
    }
  }, [trips, selectedId, onSelect, bounds]);

  return (
    <div className="relative h-[340px] overflow-hidden bg-slate-100">
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg border border-[var(--border)] bg-white/95 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-[var(--shadow-xs)]">
        Live corridor map · click a vehicle
      </div>
    </div>
  );
}
