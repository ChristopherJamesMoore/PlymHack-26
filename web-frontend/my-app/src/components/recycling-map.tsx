import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RecyclingMapProps {
  latitude: number;
  longitude: number;
  onRecyclingCentersFound?: (count: number) => void;
}

interface RecyclingCenter {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  type: string;
}

export function RecyclingMap({ latitude, longitude, onRecyclingCentersFound }: RecyclingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);
  const callbackRef = useRef(onRecyclingCentersFound);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onRecyclingCentersFound;
  }, [onRecyclingCentersFound]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // Update map center when location changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([latitude, longitude], 13);
  }, [latitude, longitude]);

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current) return;

    const userIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const userMarker = L.marker([latitude, longitude], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup('Your Location')
      .openPopup();

    return () => {
      userMarker.remove();
    };
  }, [latitude, longitude]);

  // Fetch recycling centers from Overpass API
  useEffect(() => {
    if (!isMapReady) return;

    let isSubscribed = true;

    const fetchRecyclingCenters = async () => {
      const radiusKm = 5; // Search radius in kilometers
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      
      // Overpass query to find recycling centers (not individual bins)
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="recycling"]["recycling_type"="centre"](around:${radiusKm * 1000},${latitude},${longitude});
          way["amenity"="recycling"]["recycling_type"="centre"](around:${radiusKm * 1000},${latitude},${longitude});
          node["amenity"="recycling"]["recycling:centre"="yes"](around:${radiusKm * 1000},${latitude},${longitude});
          way["amenity"="recycling"]["recycling:centre"="yes"](around:${radiusKm * 1000},${latitude},${longitude});
          way["amenity"="recycling"][!"recycling_type"](around:${radiusKm * 1000},${latitude},${longitude});
          node["amenity"="waste_transfer_station"](around:${radiusKm * 1000},${latitude},${longitude});
          way["amenity"="waste_transfer_station"](around:${radiusKm * 1000},${latitude},${longitude});
        );
        out center;
      `;

      try {
        const response = await fetch(overpassUrl, {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch recycling centers');

        const data = await response.json();
        const centers: RecyclingCenter[] = data.elements.map((element: any) => ({
          id: element.id,
          lat: element.lat || element.center?.lat,
          lon: element.lon || element.center?.lon,
          name: element.tags?.name || 'Recycling Center',
          type: element.tags?.amenity || 'recycling',
        })).filter((center: RecyclingCenter) => center.lat && center.lon);

        if (isSubscribed) {
          setRecyclingCenters(centers);
          if (callbackRef.current) {
            callbackRef.current(centers.length);
          }
        }
      } catch (error) {
        console.error('Error fetching recycling centers:', error);
        if (isSubscribed) {
          setRecyclingCenters([]);
          if (callbackRef.current) {
            callbackRef.current(0);
          }
        }
      }
    };

    fetchRecyclingCenters();

    return () => {
      isSubscribed = false;
    };
  }, [latitude, longitude, isMapReady]);

  // Add recycling center markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const recyclingIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    recyclingCenters.forEach(center => {
      const marker = L.marker([center.lat, center.lon], { icon: recyclingIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <strong>${center.name}</strong><br/>
          Type: ${center.type}<br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}" target="_blank" rel="noopener noreferrer">
            Get Directions
          </a>
        `);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [recyclingCenters]);

  return (
    <div>
      <div 
        ref={mapContainerRef} 
        style={{ 
          height: '400px', 
          width: '100%', 
          borderRadius: '8px',
          marginTop: '1rem',
          marginBottom: '1rem'
        }} 
      />
      {recyclingCenters.length > 0 && (
        <p className="text-muted small">
          Found {recyclingCenters.length} recycling center{recyclingCenters.length !== 1 ? 's' : ''} nearby
        </p>
      )}
    </div>
  );
}
