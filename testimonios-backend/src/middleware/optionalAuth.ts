import { verify } from "jsonwebtoken";
import config from "@config";
import type { NextFunction, Request, Response } from "express";
import type { CustomJwtPayload } from "./authentication";

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verify(token, config.jwtSecret) as CustomJwtPayload;
    if (!decoded.pending2FA && !decoded.setupMode) {
      req.user = decoded;
    }
  } catch {
    // Token inválido o expirado — el usuario sigue como no autenticado
  }

  next();
};
