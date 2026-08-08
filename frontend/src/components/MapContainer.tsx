import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carIcon = new L.DivIcon({
  className: 'custom-car-marker',
  html: `<div style="background-color: #059669; border: 2.5px solid white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(5, 150, 105, 0.8); cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const ChangeView: React.FC<{ polyline?: [number, number][]; center?: [number, number] }> = ({ polyline, center }) => {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [map, polyline, center]);
  return null;
};

interface MapProps {
  origin?: [number, number];
  dest?: [number, number];
  currentPos?: [number, number];
  polyline?: [number, number][];
  height?: string;
  originName?: string;
  destName?: string;
}

export const MapContainer: React.FC<MapProps> = ({
  origin = [21.1524, 79.0888], // Nagpur Railway Station, India
  dest = [21.1418, 79.0596],   // Dharampeth Tech Campus, Nagpur, India
  currentPos,
  polyline = [],
  height = '350px',
  originName = 'Nagpur Railway Station',
  destName = 'Dharampeth Tech Campus, Nagpur',
}) => {
  const { theme } = useTheme();
  const centerPos: [number, number] = currentPos || origin;

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner z-10 transition-colors">
      <LeafletMap center={centerPos} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        {/* Dynamic Tile Layer based on active Light or Dark Theme */}
        <TileLayer
          key={theme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        <ChangeView polyline={polyline.length > 0 ? polyline : [origin, dest]} center={centerPos} />

        {/* Pickup Marker */}
        <Marker position={origin} icon={pickupIcon}>
          <Popup className="custom-popup font-sans">
            <div className="p-1">
              <strong className="text-xs text-emerald-600 block font-bold">INDIAN PICKUP POINT</strong>
              <span className="text-xs text-slate-800 dark:text-slate-200">{originName}</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={dest} icon={destIcon}>
          <Popup className="custom-popup font-sans">
            <div className="p-1">
              <strong className="text-xs text-rose-600 block font-bold">INDIAN DESTINATION</strong>
              <span className="text-xs text-slate-800 dark:text-slate-200">{destName}</span>
            </div>
          </Popup>
        </Marker>

        {/* Current Vehicle Position Marker */}
        {currentPos && (
          <Marker position={currentPos} icon={carIcon}>
            <Popup>
              <div className="p-1 font-sans">
                <strong className="text-xs text-emerald-600 block">COMMUTE IN PROGRESS (INDIA)</strong>
                <span className="text-[11px] text-slate-700 dark:text-slate-300">En route through Nagpur</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        {polyline.length > 0 && (
          <Polyline
            positions={polyline}
            color={theme === 'dark' ? '#10b981' : '#059669'}
            weight={5}
            opacity={0.9}
            dashArray="1, 8"
          />
        )}
      </LeafletMap>
    </div>
  );
};
