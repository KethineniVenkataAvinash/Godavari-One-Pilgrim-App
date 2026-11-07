import React, { useEffect, useRef, useState } from 'react';
import { Zone, Facility, Incident } from '../types';
import L from 'leaflet';

interface GisMapProps {
  zones: Zone[];
  facilities: Facility[];
  incidents: Incident[];
  selectedZoneId?: string;
  onSelectZone?: (zone: Zone) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectFacility?: (facility: Facility) => void;
  height?: string;
  showHeatmap?: boolean;
  interactive?: boolean;
}

export const GisMap: React.FC<GisMapProps> = ({
  zones,
  facilities,
  incidents,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  onSelectFacility,
  height = '480px',
  showHeatmap = true,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [useFallbackSvg, setUseFallbackSvg] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Center on Rajahmundry Godavari Pushkar Ghat (17.0005, 81.7760)
        const map = L.map(mapContainerRef.current, {
          center: [17.0015, 81.7780],
          zoom: 14,
          zoomControl: interactive,
          dragging: interactive,
          scrollWheelZoom: interactive ? 'center' : false,
        });

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Godavari One Pushkaralu GIS',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers/polygons except base tile layer
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polygon || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Render Ghat Zone polygons / density overlays
      zones.forEach((zone) => {
        const color =
          zone.status === 'CRITICAL'
            ? '#DC2626'
            : zone.status === 'WARNING'
            ? '#D97706'
            : zone.status === 'MODERATE'
            ? '#2563EB'
            : '#16A34A';

        if (zone.polygon && zone.polygon.length > 0) {
          const latLngs = zone.polygon.map(p => [p.lat, p.lng] as [number, number]);
          const polygon = L.polygon(latLngs, {
            color: color,
            fillColor: color,
            fillOpacity: showHeatmap ? 0.35 : 0.15,
            weight: zone.id === selectedZoneId ? 4 : 2,
            dashArray: zone.id === selectedZoneId ? undefined : '4, 4',
          }).addTo(map);

          polygon.bindTooltip(
            `<strong>${zone.name}</strong><br/>Density: <b>${zone.density} /m²</b> (${zone.status})<br/>Occupancy: ${zone.currentCount.toLocaleString()} / ${zone.capacity.toLocaleString()}`,
            { permanent: false, direction: 'top' }
          );

          if (interactive && onSelectZone) {
            polygon.on('click', () => onSelectZone(zone));
          }
        } else {
          // Circle marker for hubs without explicit polygon
          const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
            radius: 300,
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
          }).addTo(map);
          circle.bindTooltip(`<b>${zone.name}</b><br/>Density: ${zone.density} /m²`);
          if (interactive && onSelectZone) {
            circle.on('click', () => onSelectZone(zone));
          }
        }
      });

      // Render Active Incidents
      incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'CANCELLED').forEach((inc) => {
        const iconHtml = `
          <div style="
            background-color: ${inc.severity === 'CRITICAL' ? '#DC2626' : inc.severity === 'HIGH' ? '#EA580C' : '#2563EB'};
            color: white;
            border-radius: 9999px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            border: 2px solid white;
            animation: ${inc.severity === 'CRITICAL' ? 'pulse 1.2s infinite' : 'none'};
          ">
            <img width="20" height="20" alt="Incident" src="/assets/icons/${inc.type === 'MEDICAL' ? 'ambulance' : inc.type === 'CROWD_CRUSH_HAZARD' ? 'triangle-alert' : inc.type === 'LOST_CHILD_PERSON' ? 'baby' : 'siren'}.svg" />
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'incident-map-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <b style="color: #991B1B;">[${inc.severity}] ${inc.referenceNumber}</b><br/>
            <b>${inc.title}</b><br/>
            <span>Status: <b>${inc.status}</b></span><br/>
            <span>Zone: ${inc.zoneName}</span>
          </div>
        `);

        if (interactive && onSelectIncident) {
          marker.on('click', () => onSelectIncident(inc));
        }
      });

      // Render Facilities
      facilities.forEach((fac) => {
        const symbol =
          fac.type === 'FIRST_AID' ? 'hospital' :
          fac.type === 'TOILET' ? 'accessibility' :
          fac.type === 'WATER_POINT' ? 'droplets' :
          fac.type === 'PARKING' ? 'parking-circle' :
          fac.type === 'SHUTTLE_STOP' ? 'bus' :
          fac.type === 'HELP_DESK' ? 'info' : 'map-pin';

        const facIcon = L.divIcon({
          html: `
            <div style="
              background-color: #0E3B33;
              color: white;
              border-radius: 6px;
              padding: 2px 5px;
              font-size: 11px;
              display: flex;
              align-items: center;
              border: 1px solid #E27D60;
              box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            ">
              <img width="20" height="20" alt="Facility" src="/assets/icons/${symbol}.svg" />
            </div>
          `,
          className: 'facility-map-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([fac.location.lat, fac.location.lng], { icon: facIcon }).addTo(map);
        marker.bindTooltip(`<b>${fac.name}</b><br/>Status: ${fac.status}`);

        if (interactive && onSelectFacility) {
          marker.on('click', () => onSelectFacility(fac));
        }
      });

    } catch (e) {
      console.warn('Leaflet initialization fallback to SVG', e);
      setUseFallbackSvg(true);
    }

    return () => {
      // Keep map clean
    };
  }, [zones, facilities, incidents, selectedZoneId, showHeatmap, interactive]);

  // If in environment with network constraint or leaflet issue, provide vector GIS fallback
  if (useFallbackSvg) {
    return (
      <div 
        style={{ height }}
        className="w-full relative bg-[#0D2825] rounded-xl overflow-hidden border border-[#1B4D45] p-4 text-white flex flex-col justify-between"
      >
        <div className="flex items-center justify-between z-10 bg-[#071F1C]/80 px-3 py-1.5 rounded-lg border border-[#144740] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald-300">Rajahmundry Godavari River Basin GIS</span>
          </div>
          <span className="text-[11px] text-gray-300">Vector Mode Active</span>
        </div>

        {/* SVG schematic representation of Godavari curve & Ghats */}
        <div className="relative flex-1 my-2 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* River flow */}
            <path
              d="M 50,380 C 250,300 450,220 550,140 C 650,60 750,20 780,10"
              stroke="#0284C7"
              strokeWidth="90"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
            <path
              d="M 50,380 C 250,300 450,220 550,140 C 650,60 750,20 780,10"
              stroke="#38BDF8"
              strokeWidth="12"
              strokeDasharray="16 8"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
            {/* Ghat stations along river */}
            <circle cx="280" cy="270" r="14" fill="#E27D60" />
            <text x="300" y="275" fill="#F8FAFC" fontSize="12" fontWeight="600">Pushkar Ghat (Main)</text>

            <circle cx="480" cy="180" r="14" fill="#D97706" />
            <text x="500" y="185" fill="#F8FAFC" fontSize="12" fontWeight="600">Saraswati Ghat (4.38/m²)</text>

            <circle cx="620" cy="100" r="14" fill="#EA580C" />
            <text x="640" y="105" fill="#F8FAFC" fontSize="12" fontWeight="600">Kotilingala Ghat (3.64/m²)</text>

            <circle cx="160" cy="330" r="12" fill="#16A34A" />
            <text x="180" y="335" fill="#F8FAFC" fontSize="12" fontWeight="600">Markandeya Ghat</text>
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300 bg-[#071F1C]/80 px-3 py-1.5 rounded-lg border border-[#144740]">
          <span>Ghats: 4 Active</span>
          <span>River Flow: 1.4 m/s (Normal)</span>
          <span>Bathing Status: Safe within yellow buoys</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />
      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-gray-200 text-xs flex flex-wrap items-center gap-3">
        <span className="font-semibold text-gray-700">Density:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal (&lt;2/m²)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning (&gt;3/m²)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Critical (&gt;4/m²)
        </span>
      </div>
    </div>
  );
};
