# Testimonios

Sistema de archivo de testimonios del Bicentenario — aplicación fullstack para recopilar, gestionar y visualizar testimonios multimedia con soporte para audio, video, imágenes y geolocalización.

## Arquitectura

## Stack Tecnológico

### Frontend (`testimonios-frontend/`)

| Capa             | Tecnología                             |
| ---------------- | -------------------------------------- |
| Framework        | Angular 20                             |
| UI Components    | Angular Material + CDK                 |
| State Management | NgRx Signals                           |
| Mapas            | Leaflet + @bluehalo/ngx-leaflet        |
| Multimedia       | Cloudinary, Video.js, ngx-audio-player |
| Animaciones      | Anime.js, Swiper                       |
| Utilidades       | date-fns, boxicons                     |

### Backend (`testimonios-backend/`)

| Capa          | Tecnología                          |
| ------------- | ----------------------------------- |
| Runtime       | Bun + TypeScript                    |
| Framework     | Express 5                           |
| ORM           | Prisma (con Accelerate)             |
| Autenticación | Better Auth + JWT + 2FA (speakeasy) |
| Caché         | Redis (ioredis) + apicache          |
| Transcripción | Deepgram SDK                        |
| Storage       | Cloudinary                          |
| Uploads       | Multer                              |
| Docs          | Swagger UI                          |
| Validación    | Valibot                             |
| Email         | Nodemailer                          |

## Quick Start (Docker)

Forma recomendada de levantar todo el stack:

```bash
# Clonar el repositorio
git clone <repo-url>
cd testimonios

# Levantar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f
```

Esto levanta 4 servicios:

| Servicio   | URL                   | Descripción         |
| ---------- | --------------------- | ------------------- |
| Frontend   | <http://localhost:4200> | Angular app (nginx) |
| Backend    | <http://localhost:4000> | API REST + Swagger  |
| PostgreSQL | localhost:5432        | Base de datos       |
| Redis      | localhost:6379        | Caché               |

```bash
# Detener todo
docker compose down

# Detener y borrar volúmenes (pierde datos)
docker compose down -v
```

## Setup Individual

### Backend

```bash
cd testimonios-backend

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL, JWT_SECRET, etc.

# Generar cliente Prisma y aplicar migraciones
bunx prisma generate
bunx prisma db push

# (Opcional) Seed de datos iniciales
bunx prisma db seed

# Desarrollo (hot reload)
bun dev

# Producción
bun start
```

El backend queda en `http://localhost:4000`. Swagger docs en `http://localhost:4000/api/docs`.

### Frontend

```bash
cd testimonios-frontend

# Instalar dependencias
npm install

# Desarrollo
npm start
# o: ng serve

# Build producción
npm run build
```

El frontend queda en `http://localhost:4200`.

## Estructura del Proyecto

```
testimonios/
├── docker-compose.yml          # Orquestación de servicios
├── testimonios-backend/        # API REST
│   ├── src/
│   │   ├── models/             # Modelos de datos y lógica de negocio
│   │   ├── routes/             # Definición de rutas
│   │   ├── middleware/         # Middlewares (auth, validation, etc.)
│   │   ├── services/           # Servicios externos
│   │   └── lib/                # Utilidades
│   ├── prisma/                 # Schema y migraciones
│   ├── tests/                  # Tests
│   ├── index.ts                # Entry point
│   └── config.ts               # Configuración
└── testimonios-frontend/       # App Angular
    └── src/
        └── app/                # Componentes, servicios, stores
```

## Endpoints Principales

| Método | Ruta                    | Descripción                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/auth/login`           | Iniciar sesión                |
| POST   | `/auth/register`        | Registrar usuario             |
| POST   | `/auth/forgot-password` | Solicitar reset de contraseña |
| POST   | `/auth/reset-password`  | Resetear contraseña           |
| GET    | `/testimonios`          | Listar testimonios            |
| POST   | `/testimonios`          | Crear testimonio              |

Documentación interactiva completa disponible en `/api/docs` del backend.

## Variables de Entorno

### Backend (`.env`)

| Variable           | Descripción                         |
| ------------------ | ----------------------------------- |
| `DATABASE_URL`     | URL de conexión PostgreSQL          |
| `JWT_SECRET`       | Clave para firmar tokens JWT        |
| `REDIS_URL`        | URL de conexión Redis               |
| `CLOUDINARY_*`     | Credenciales de Cloudinary          |
| `DEEPGRAM_API_KEY` | API key para transcripción          |
| `SMTP_*`           | Configuración de email (Nodemailer) |

Ver `testimonios-backend/.env.example` para todas las opciones.

## Scripts Disponibles

### Backend

| Comando                   | Descripción                       |
| ------------------------- | --------------------------------- |
| `bun dev`                 | Desarrollo con hot reload         |
| `bun start`               | Producción                        |
| `bun test`                | Ejecutar tests                    |
| `bunx prisma studio`      | UI visual para la base de datos   |
| `bunx prisma migrate dev` | Aplicar migraciones en desarrollo |

### Frontend

| Comando         | Descripción                     |
| --------------- | ------------------------------- |
| `npm start`     | Desarrollo con live reload      |
| `npm run build` | Build de producción             |
| `npm run watch` | Build incremental en desarrollo |
| `npm test`      | Ejecutar tests unitarios        |
