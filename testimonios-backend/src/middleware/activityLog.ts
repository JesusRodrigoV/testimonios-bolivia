import type { NextFunction, Request, Response } from "express";
import prisma from "@app/lib/prisma";

export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      const sensitiveFields = ["password", "token", "twoFactorToken", "newPassword", "two_factor_secret"];
      const sanitizedBody = req.body
        ? Object.fromEntries(
            Object.entries(req.body).filter(([key]) => !sensitiveFields.includes(key)),
          )
        : req.body;

      const logData: {
        accion: string;
        detalle: string;
        fecha: Date;
        id_usuario?: number;
      } = {
        accion: `${req.method} ${req.originalUrl}`,
        detalle: JSON.stringify({
          status: res.statusCode,
          params: req.params,
          query: req.query,
          body: sanitizedBody,
          duration: Date.now() - start,
        }),
        fecha: new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" }),
        ),
      };

      if (req.user?.id_usuario) {
        logData.id_usuario = req.user.id_usuario;
      }

      await prisma.logs.create({
        data: logData,
      });

    } catch (error) {
      console.error("Error registrando log:", error);
    }
  });

  next();
};