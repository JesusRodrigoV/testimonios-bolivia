# Testimonios Backend

Backend de la aplicación "Sistema de archivo de testimonios del Bicentenario" desarrollado con Bun, TypeScript y Prisma.

## Enlace proyecto Frontend

[Frontend](https://github.com/JesusRodrigoV/testimonios-frontend)

## Pre-requisitos 📋

- [Bun](https://bun.sh/) (v1.0.0 o superior)
- PostgreSQL (14.0 o superior)
- Node.js (opcional, pero recomendado para usar algunas herramientas de Prisma)

## Instalación 🚀

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/testimonios-backend.git
cd testimonios-backend
```

2. **Instalar dependencias**

```bash
bun install
```

3. **Configurar variables de entorno**

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus configuraciones
# Principalmente necesitarás configurar:
# - DATABASE_URL
# - JWT_SECRET
# - SMTP_* (para envío de emails)
```

## Configuración de la Base de Datos 💾

### Si ya tienes una base de datos

1. Asegúrate de que la URL de conexión en tu `.env` sea correcta
2. Sincroniza el schema de Prisma con tu base de datos:

```bash
bunx prisma generate
bunx prisma db push
```

### Si necesitas crear una nueva base de datos

1. Crea una base de datos en PostgreSQL:

```bash
createdb testimonios
```

2. Aplica las migraciones:

```bash
bunx prisma migrate dev
```

3. (Opcional) Si quieres ver tus datos:

```bash
bunx prisma studio
```

## Ejecutar el proyecto 🏃‍♂️

```bash
# Modo desarrollo con hot reload
bun dev

# O modo producción
bun start
```

El servidor estará corriendo en `http://localhost:4000` por defecto.

## Endpoints principales 🛣️

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/forgot-password` - Solicitar reset de contraseña
- `POST /auth/reset-password` - Resetear contraseña
- `GET /testimonios` - Obtener testimonios
- `POST /testimonios` - Crear nuevo testimonio

## Scripts disponibles 📜

Con esto inicias el servidor:

- `bun dev` - Inicia el servidor en modo desarrollo

## Estructura del proyecto 🏗️

```
src/
├── models/         # Modelos de datos y lógica de negocio
├── routes/         # Definición de rutas
├── middleware/     # Middlewares
├── lib/           # Utilidades y helpers
├── services/      # Servicios
└── index.ts       # Punto de entrada
```
