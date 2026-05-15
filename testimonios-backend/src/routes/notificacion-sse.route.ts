import { Router } from "express";
import { verify } from "jsonwebtoken";
import config from "@config";
import prisma from "@app/lib/prisma";
import { sseManager } from "@app/lib/sse-manager";
import type { JwtPayload } from "jsonwebtoken";

interface SseJwtPayload extends JwtPayload {
  id_usuario: number;
  id_rol: number;
}

export const sseRouter = Router();

sseRouter.get("/stream", async (req, res) => {
  const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  let decoded: SseJwtPayload;
  try {
    decoded = verify(token, config.jwtSecret) as SseJwtPayload;
  } catch {
    res.status(403).json({ error: "Token inválido o expirado" });
    return;
  }

  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: decoded.id_usuario },
    select: { is_active: true },
  });

  if (!user?.is_active) {
    res.status(403).json({ error: "Usuario no activo" });
    return;
  }

  if (!sseManager.canAddClient(decoded.id_usuario)) {
    res.status(429).json({ error: "Demasiadas conexiones activas" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  sseManager.addClient(decoded.id_usuario, res);

  const heartbeat = setInterval(() => {
    try {
      res.write(":heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  res.setTimeout(120000, () => {
    clearInterval(heartbeat);
    res.end();
  });

  req.on("close", () => {
    clearInterval(heartbeat);
    sseManager.removeClient(decoded.id_usuario, res);
  });

  req.on("error", () => {
    clearInterval(heartbeat);
    sseManager.removeClient(decoded.id_usuario, res);
  });
});
