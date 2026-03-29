import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { getEraForYear } from '../data/empireBounds.js';
import { BATTLES } from '../data/battles.js';

// Fix Leaflet's broken default icon paths in Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ROME = [41.9, 12.5];

const battleIcon = L.divIcon({
  className: 'battle-marker',
  html: '<div class="battle-marker-inner">⚔️</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const romeIcon = L.divIcon({
  className: 'rome-marker',
  html: '<div class="rome-marker-inner">🏛️</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Fly to new center when emperor changes
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function EmpireMap({ emperor }) {
  const era = emperor ? getEraForYear(emperor.reign_start) : getEraForYear(null);
  const battles = emperor ? (BATTLES[emperor.name] || []) : [];
  const mappableBattles = battles.filter(b => b.lat && b.lng);

  // Convert our [lng, lat] GeoJSON to Leaflet's [lat, lng]
  const polygons = era.coordinates.map(ring =>
    ring.map(([lng, lat]) => [lat, lng])
  );

  const center = [era.center[1], era.center[0]]; // swap from [lng, lat] to [lat, lng]

  function formatYear(year) {
    if (year == null) return '?';
    if (year < 0) return `${Math.abs(year)} BC`;
    return `AD ${year}`;
  }

  return (
    <div className="empire-map-wrap">
      <div className="empire-map-header">
        {emperor ? (
          <>
            <span className="empire-map-era-badge">{era.label}</span>
            <span className="empire-map-emperor">
              {emperor.name} · {formatYear(emperor.reign_start)}–{formatYear(emperor.reign_end)}
            </span>
          </>
        ) : (
          <span className="empire-map-era-badge">{era.label}</span>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={era.zoom}
        className="empire-map-container"
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={era.zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Empire boundary */}
        {polygons.map((ring, i) => (
          <Polygon
            key={i}
            positions={ring}
            pathOptions={{
              color: '#8B1A1A',
              weight: 2,
              fillColor: '#CC3333',
              fillOpacity: 0.18,
              dashArray: '6 4',
            }}
          />
        ))}

        {/* Rome marker */}
        <Marker position={ROME} icon={romeIcon}>
          <Popup>🏛️ Rome — Capital of the Empire</Popup>
        </Marker>

        {/* Battle markers */}
        {mappableBattles.map((b, i) => (
          <Marker key={i} position={[b.lat, b.lng]} icon={battleIcon}>
            <Popup>
              <strong>⚔️ {b.name}</strong><br />
              {formatYear(b.year)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {!emperor && (
        <p className="empire-map-hint">Click an emperor in the list below to highlight their era.</p>
      )}
    </div>
  );
}
