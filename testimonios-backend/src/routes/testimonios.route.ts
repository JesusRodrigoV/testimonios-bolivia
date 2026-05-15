import express from "express";
import type { RequestHandler } from "express";
import { TestimonyController } from "@app/controllers/testimonio.controller";
import { authenticateToken } from "@app/middleware/authentication";
import { optionalAuth } from "@app/middleware/optionalAuth";
import { Rol, authorizeRoles, checkDownloadPermission } from "@app/middleware/authorization";
import { logActivity } from "@app/middleware/activityLog";
import { authCache, clearCache, publicCache } from "@app/middleware/cache";

export const testimoniosRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Testimonios
 *   description: API para gestionar testimonios
 */
testimoniosRouter.get(
  "/count",
  publicCache(),
  TestimonyController.getCount as RequestHandler
);
testimoniosRouter.get(
  "/map/data",
  publicCache("1 hour"),
  TestimonyController.getMapData as RequestHandler
);
testimoniosRouter.get(
  "/media-types",
  authenticateToken,
  authCache(),
  TestimonyController.getAllMediaTypes as RequestHandler
);
testimoniosRouter.get(
  "/statuses",
  authenticateToken,
  authCache(),
  TestimonyController.getAllStatuses as RequestHandler
);
testimoniosRouter.get(
  "/my-uploads/count",
  authenticateToken,
  authCache(),
  TestimonyController.getCountByUserId as RequestHandler
);
testimoniosRouter.get(
  "/my-uploads",
  authenticateToken,
  authCache(),
  TestimonyController.getByUserId as RequestHandler
);
testimoniosRouter.get(
  "/",
  optionalAuth,
  TestimonyController.search as RequestHandler
);
testimoniosRouter.get(
  "/:id",
  publicCache(),
  TestimonyController.getById as RequestHandler
);
testimoniosRouter.get(
  "/:id/versions",
  authenticateToken,
  authCache(),
  TestimonyController.getVersions as RequestHandler
);
testimoniosRouter.get(
  "/:id/download",
  authenticateToken,
  checkDownloadPermission as RequestHandler,
  TestimonyController.download as RequestHandler
);

testimoniosRouter.post(
  "/",
  authenticateToken,
  clearCache(["/media"]),
  TestimonyController.create as RequestHandler
);
testimoniosRouter.post(
  "/validate",
  authenticateToken,
  authorizeRoles(Rol.ADMIN, Rol.CURADOR),
  clearCache(["/media"]),
  TestimonyController.validate as RequestHandler
);
testimoniosRouter.patch(
  "/:id",
  authenticateToken,
  authorizeRoles(Rol.ADMIN, Rol.CURADOR),
  clearCache(["/media"]),
  TestimonyController.update as RequestHandler
);
testimoniosRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(Rol.ADMIN, Rol.CURADOR),
  clearCache(["/media"]),
  TestimonyController.delete as RequestHandler
);
