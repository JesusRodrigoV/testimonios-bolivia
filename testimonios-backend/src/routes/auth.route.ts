import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { Rol, authorizeRoles } from "@app/middleware/authorization";
import {
  allow2FAVerification,
  authenticateToken,
} from "@app/middleware/authentication";
import { logActivity } from "@app/middleware/activityLog";
import { AuthController } from "@app/controllers/auth.controller";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos, intente de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.use(logActivity);
authRouter.use("/login", authLimiter);
authRouter.use("/forgot-password", authLimiter);
authRouter.use("/register", authLimiter);
authRouter.get("/profile", authenticateToken, AuthController.authProfile as unknown as RequestHandler);
authRouter.get("/user-info/:id", authenticateToken, AuthController.getUserInfo as unknown as RequestHandler);
authRouter.post("/register", AuthController.authRegister as unknown as RequestHandler);
authRouter.post(
  "/users",
  authenticateToken,
  authorizeRoles(Rol.ADMIN),
  AuthController.adminPostUsers as unknown as RequestHandler
);
authRouter.get(
  "/users",
  authenticateToken,
  authorizeRoles(Rol.ADMIN),
  AuthController.adminGetUsers as unknown as RequestHandler
);
authRouter.patch(
  "/users/:id",
  authenticateToken,
  authorizeRoles(Rol.ADMIN),
  AuthController.adminPatchUsers as unknown as RequestHandler
);
authRouter.patch("/profile", authenticateToken, AuthController.updateProfile as unknown as RequestHandler);
authRouter.delete(
  "/users/:id",
  authenticateToken,
  authorizeRoles(Rol.ADMIN),
  AuthController.adminDeleteUsers as unknown as RequestHandler
);
authRouter.post("/login", AuthController.login as unknown as RequestHandler);
authRouter.post("/forgot-password", AuthController.forgot_password as unknown as RequestHandler);
authRouter.post("/reset-password", AuthController.reset_password as unknown as RequestHandler);
authRouter.post("/setup-2fa", authenticateToken, AuthController.setup2FA as unknown as RequestHandler);
authRouter.post("/verify-2fa", allow2FAVerification, AuthController.verify2FA as unknown as RequestHandler);
authRouter.post("/logout", authenticateToken, AuthController.logout as unknown as RequestHandler);
authRouter.post("/refresh", AuthController.refresh as unknown as RequestHandler);
