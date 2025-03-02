import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

interface Location {
  latitude: number;
  longitude: number;
}

export default function Tracking() {
  const [location] = useLocation();
  const trackingCode = new URLSearchParams(location.split('?')[1]).get('code');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (!trackingCode) {
      setError("Código de seguimiento no proporcionado");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?code=${trackingCode}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update') {
          setCurrentLocation(data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = () => {
      setError("Error en la conexión de seguimiento");
    };

    return () => {
      ws.close();
    };
  }, [trackingCode]);

  if (loadError || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card">
          <div className="text-center text-destructive">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error || "Error al cargar el mapa"}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isLoaded || !currentLocation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card">
          <div className="text-center">
            <p className="text-lg">Cargando seguimiento en tiempo real...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-card">
        <h1 className="text-2xl font-bold mb-4 text-center">Seguimiento en Tiempo Real</h1>
        <div className="w-full h-[400px] rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{
              lat: currentLocation.latitude,
              lng: currentLocation.longitude,
            }}
            zoom={15}
          >
            <Marker
              position={{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
              }}
            />
          </GoogleMap>
        </div>
      </Card>
    </div>
  );
}
