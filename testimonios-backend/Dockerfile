# Etapa 1: Construcción y generación de Prisma
FROM oven/bun:1 AS builder
WORKDIR /app

# Copiamos dependencias (Aquí cambiamos bun.lockb por bun.lock)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copiamos el código fuente
COPY . .

# Generamos el cliente de Prisma (Obligatorio antes de compilar)
RUN bunx prisma generate

# Etapa 2: Producción
FROM oven/bun:1-slim
WORKDIR /app

# Copiamos lo construido en la etapa anterior para mantener la imagen ligera
COPY --from=builder /app ./

# Exponemos el puerto de Express
EXPOSE 4000

CMD ["bun", "run", "index.ts"]