import { WebSocketServer, WebSocket } from 'ws';
import { type Server } from 'http';
import { db } from './db';
import { services, type Service } from '@shared/schema';
import { eq } from 'drizzle-orm';

const clients = new Map<string, WebSocket>();

export function setupTrackingServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const trackingCode = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('code');

    if (!trackingCode) {
      ws.close();
      return;
    }

    clients.set(trackingCode, ws);

    ws.on('close', () => {
      clients.delete(trackingCode);
    });
  });
}

export async function updateServiceLocation(
  trackingCode: string,
  latitude: number,
  longitude: number
) {
  try {
    // Actualizar la ubicación en la base de datos
    await db
      .update(services)
      .set({
        latitudActual: latitude.toString(),
        longitudActual: longitude.toString(),
        ultimaActualizacion: new Date(),
      })
      .where(eq(services.codigoSeguimiento, trackingCode));

    // Enviar actualización a los clientes conectados
    const ws = clients.get(trackingCode);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'location_update',
        data: { latitude, longitude }
      }));
    }
  } catch (error) {
    console.error('Error al actualizar la ubicación:', error);
  }
}