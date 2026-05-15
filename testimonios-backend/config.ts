export const config = {
  jwtSecret: (process.env.JWT_SECRET as string) || "",
  port: process.env.PORT || 4000,
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: parseInt(process.env.EMAIL_PORT || "587"),
  emailUser: process.env.EMAIL_USER || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
  roles: {
    admin: 1,
    curador: 2,
    investigador: 3,
    visitante: 4,
  },
  jwt: {
    accessTokenExpiry: "1h" as const,
    tempTokenExpiry: "15m" as const,
    pending2FAExpiry: "5m" as const,
  },
  saltRounds: 10,
  mediaType: {
    audio: 1,
    video: 2,
    texto: 3,
    imagen: 4,
  },
  status: {
    pendiente: 1,
    aprobado: 2,
    rechazado: 3,
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};

export default config;
