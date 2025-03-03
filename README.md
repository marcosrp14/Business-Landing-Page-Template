
# MiCargaEx - Aplicación de Tracking y WhatsApp

## Descripción

MiCargaEx es una aplicación web que permite a los usuarios enviar información a través de un formulario y luego redireccionar a WhatsApp para continuar la comunicación. Ideal para empresas de logística y envíos que desean ofrecer seguimiento de servicios a sus clientes.

## Características

- Formulario de contacto interactivo
- Redirección a WhatsApp después del envío del formulario
- Seguimiento de servicios mediante código de seguimiento
- Interfaz moderna y responsiva con Tailwind CSS
- Backend con Express y Drizzle ORM
- Base de datos PostgreSQL

## Tecnologías utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL (via NeonDB)
- **ORM**: Drizzle
- **Otras**: React Hook Form, React Query, WebSockets, Google Maps API

## Requisitos previos

- Node.js (versión 18 o superior)
- NPM o Yarn
- Cuenta en NeonDB o servicio similar de PostgreSQL

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/2be4d0a4-db66-4d49-9cb2-32e22c1f01cd/micargaex.git
cd micargaex
```

2. Instala las dependencias:

```bash
npm install
```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
SESSION_SECRET=tu_secreto_de_sesion
GOOGLE_MAPS_API_KEY=tu_clave_api_de_google_maps
```

2. Ejecuta las migraciones de la base de datos:

```bash
npm run db:push
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Esto iniciará:
- El servidor backend en http://0.0.0.0:5000
- El servidor de desarrollo de Vite para el frontend

## Construcción para producción

```bash
npm run build
```

## Despliegue

La aplicación está configurada para ser desplegada en Replit. Utiliza el comando:

```bash
npm run start
```

## Estructura del proyecto

- `/client`: Código del frontend (React, TypeScript)
  - `/src/components`: Componentes reutilizables
  - `/src/pages`: Páginas de la aplicación
  - `/src/hooks`: Custom hooks
- `/server`: API y lógica del backend
  - `/routes.ts`: Definición de rutas de la API
  - `/db.ts`: Configuración de la base de datos
  - `/tracking.ts`: Lógica para el seguimiento de envíos
- `/shared`: Esquemas y tipos compartidos entre frontend y backend

## Uso

1. Completa el formulario con la información requerida
2. Envía el formulario
3. Serás redirigido a WhatsApp para continuar la comunicación
4. Utiliza el código de seguimiento proporcionado para consultar el estado de tu servicio

## Contribución

1. Fork el repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

[MIT](LICENSE)

## Contacto

Para consultas, problemas o sugerencias, abre un issue en el repositorio de GitHub.

---

Desarrollado con ❤️ en MiCargaEx
