import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import * as routers from '@app/routes';
import path from 'path';

if (!config.jwtSecret) {
  console.error("FATAL: JWT_SECRET no está configurado en las variables de entorno");
  process.exit(1);
}

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

import { sseRouter } from "@app/routes/notificacion-sse.route";

app.use("/auth", routers.authRouter);
app.use("/media", routers.testimoniosRouter);
app.use("/categories", routers.categoriaRouter);
app.use("/tags", routers.etiquetaRouter);
app.use("/events", routers.eventoRouter);
app.use("/comments", routers.comentarioRouter);
app.use("/notifications", sseRouter);
app.use("/notifications", routers.notificacionRouter);
app.use("/collections", routers.coleccionRouter);
app.use("/transcription", routers.transcripcionRouter);
app.use("/score", routers.calificacionRouter);
app.use("/forumtopics", routers.forotemaRouter);
app.use("/forumcomments", routers.forocomentarioRouter);
app.use("/api-docs", routers.swaggerRouter);

import { AppError } from "@app/lib/errors";

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: "Error interno del servidor" });
  },
);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
