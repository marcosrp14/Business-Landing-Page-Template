
# Aplicación de Tracking y WhatsApp

Este proyecto es una aplicación web que permite a los usuarios enviar información a través de un formulario y luego redireccionar a WhatsApp para continuar la comunicación.

## Características

- Formulario de contacto interactivo
- Redirección a WhatsApp después del envío del formulario
- Seguimiento de servicios mediante código de seguimiento
- Interfaz moderna y responsiva con Tailwind CSS
- Backend con Express y Drizzle ORM

## Tecnologías utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL (via NeonDB)
- **ORM**: Drizzle
- **Otras**: React Hook Form, React Query, WebSockets

## Requisitos previos

- Node.js (versión 18 o superior)
- NPM o Yarn

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/nombre-repo.git
cd nombre-repo
```

2. Instala las dependencias:

```bash
npm install
```

## Configuración

Configura las variables de entorno necesarias para la conexión a la base de datos y otras configuraciones.

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

- `/client`: Código del frontend
- `/server`: API y lógica del backend
- `/shared`: Esquemas y tipos compartidos entre frontend y backend

## Uso

1. Completa el formulario con la información requerida
2. Envía el formulario
3. Serás redirigido a WhatsApp para continuar la comunicación
4. Utiliza el código de seguimiento proporcionado para consultar el estado de tu servicio

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar o mejorar.

## Licencia

[MIT](LICENSE)
