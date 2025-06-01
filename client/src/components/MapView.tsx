import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  height?: string;
  agents?: Array<{
    id: number;
    latitude: string;
    longitude: string;
    agent?: {
      name: string;
    };
  }>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export default function MapView({ height = "24rem", agents = [], userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([12.9141, 77.6321], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: '<div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"><i class="fas fa-home text-white text-xs"></i></div>',
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon
      }).addTo(map);

      markersRef.current.push(userMarker);
    }

    // Add agent markers
    agents.forEach(agent => {
      const agentIcon = L.divIcon({
        html: '<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse"><i class="fas fa-truck text-white text-xs"></i></div>',
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const agentMarker = L.marker([parseFloat(agent.latitude), parseFloat(agent.longitude)], {
        icon: agentIcon
      }).addTo(map);

      if (agent.agent?.name) {
        agentMarker.bindPopup(agent.agent.name);
      }

      markersRef.current.push(agentMarker);
    });
  }, [agents, userLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full bg-gradient-to-br from-blue-100 to-green-100 relative"
      style={{ height }}
    >
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </div>
  );
}
