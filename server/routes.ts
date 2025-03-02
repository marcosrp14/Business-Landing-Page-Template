import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from 'nanoid';
import { db } from './db';
import { services } from '@shared/schema';

export function registerRoutes(app: Express): Server {
  // Endpoint para crear un nuevo servicio
  app.post('/api/services', async (req, res) => {
    try {
      const serviceData = req.body;
      const codigoSeguimiento = nanoid(10);

      // Insertar el servicio en la base de datos
      const [newService] = await db.insert(services).values({
        ...serviceData,
        codigoSeguimiento,
        estado: 'pendiente',
        fechaSolicitud: new Date(),
      }).returning();

      res.json({ 
        codigoSeguimiento: newService.codigoSeguimiento,
        message: 'Servicio creado exitosamente' 
      });
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      res.status(500).json({ 
        message: 'Error al crear el servicio' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}