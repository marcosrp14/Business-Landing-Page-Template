import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  tipoServicio: text("tipo_servicio").notNull(), // moto_cadete, utilitario_paqueteria, pickup_flete
  nombreCliente: text("nombre_cliente").notNull(),
  apellidoCliente: text("apellido_cliente").notNull(),
  telefono: text("telefono").notNull(),
  direccionCarga: text("direccion_carga").notNull(),
  direccionEntrega: text("direccion_entrega").notNull(),
  recomendaciones: text("recomendaciones"),
  latitudCarga: decimal("latitud_carga", { precision: 10, scale: 6 }).notNull(),
  longitudCarga: decimal("longitud_carga", { precision: 10, scale: 6 }).notNull(),
  latitudEntrega: decimal("latitud_entrega", { precision: 10, scale: 6 }).notNull(),
  longitudEntrega: decimal("longitud_entrega", { precision: 10, scale: 6 }).notNull(),
  precioEstimado: decimal("precio_estimado", { precision: 10, scale: 2 }).notNull(),
  fechaSolicitud: timestamp("fecha_solicitud").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  fechaSolicitud: true
});

// Esquema extendido para validación del formulario
export const serviceFormSchema = insertServiceSchema.extend({
  tipoServicio: z.enum(["moto_cadete", "utilitario_paqueteria", "pickup_flete"], {
    errorMap: () => ({ message: "Seleccione un tipo de servicio válido" })
  }),
  telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  nombreCliente: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidoCliente: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;