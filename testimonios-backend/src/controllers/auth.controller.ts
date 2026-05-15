import type { Request, Response } from "express";
import {
  authSchema,
  userSchema,
  passwordSchema,
  updateUserSchema,
  UserModel,
} from "../models";
import { Rol } from "@app/middleware/authorization";
import { partial, safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import config from "@config";
import { send2FASetupEmail, sendPasswordResetEmail } from "@app/lib/email";
import prisma from "@app/lib/prisma";

export class AuthController {
  static authProfile = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const userId = req.user?.id_usuario;

      if (!userId) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const user = await prisma.usuarios.findUnique({
        where: { id_usuario: userId },
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          biografia: true,
          id_rol: true,
          two_factor_enabled: true,
          profile_image: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.json({
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        biografia: user.biografia,
        role: user.id_rol,
        two_factor_enabled: user.two_factor_enabled,
        profile_image: user.profile_image,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener perfil",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static authRegister = async (req: Request, res: Response): Promise<void | Response> => {
    const result = safeParse(userSchema, req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Bad Request",
        errors: result.issues,
      });
      return;
    }

    try {
      const user = await UserModel.createUser({
        ...result.output,
        id_rol: Rol.VISITANTE,
      });

      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        res.status(400).json({
          message: "El email ya está registrado",
        });
        return;
      }
      return res.status(500).json({
        message: "Error al crear el usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  static adminPostUsers = async (
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    const result = safeParse(userSchema, req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Bad Request",
        errors: result.issues,
      });
      return;
    }

    try {
      const user = await UserModel.createUser(result.output);
      res.status(201).json(user);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        res.status(400).json({
          message: "El email ya está registrado",
        });
        return;
      }
      return res.status(500).json({
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static adminGetUsers = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const users = await prisma.usuarios.findMany({
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          biografia: true,
          id_rol: true,
          last_login: true,
          two_factor_enabled: true,
          profile_image: true,
        },
      });
      res.json(users);
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static adminPatchUsers = async (
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    const userIdParam = req.params.id;
    if (!userIdParam) {
      res.status(400).json({ message: "ID de usuario requerido" });
      return;
    }
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID de usuario inválido" });
      return;
    }

    const result = safeParse(updateUserSchema, req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: result.issues,
      });
      return;
    }

    try {
      const updateData = result.output;

      const updatedUser = await prisma.usuarios.update({
        where: { id_usuario: userId },
        data: {
          nombre: updateData.nombre,
          biografia: updateData.biografia,
          id_rol: updateData.id_rol,
        },
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          biografia: true,
          id_rol: true,
          profile_image: true,
          two_factor_enabled: true,
        },
      });
      res.json(updatedUser);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      return res.status(500).json({
        message: "Error al actualizar usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  static adminDeleteUsers = async (
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    const userIdParam = req.params.id;
    if (!userIdParam) {
      res.status(400).json({ message: "ID de usuario requerido" });
      return;
    }
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID de usuario inválido" });
      return;
    }

    try {
      if (req.user?.id_usuario === userId) {
        res
          .status(400)
          .json({ message: "No puedes eliminar tu propia cuenta" });
        return;
      }

      const user = await prisma.usuarios.findUnique({
        where: { id_usuario: userId },
        select: { email: true },
      });
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const timestamp = Date.now();
      const [localPart, domain] = user.email.split('@');
      const deletedEmail = `deleted_${timestamp}_${localPart}@${domain}`;

      await prisma.usuarios.update({
        where: { id_usuario: userId },
        data: { is_active: false, email: deletedEmail },
      });
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to delete not found")
      ) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      return res.status(500).json({
        message: "Error deleting user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static updateProfile = async (req: Request, res: Response): Promise<void | Response> => {
    const userId = req.user?.id_usuario;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const result = safeParse(partial(userSchema), req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: result.issues,
      });
      return;
    }

    try {
      const { password, ...safeData } = result.output;
      const updateData = {
        ...safeData,
        profile_image: req.body.profile_image,
      };

      const updatedUser = await prisma.usuarios.update({
        where: { id_usuario: userId },
        data: updateData,
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          biografia: true,
          id_rol: true,
          profile_image: true,
          two_factor_enabled: true,
        },
      });
      res.json({
        id_usuario: updatedUser.id_usuario,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        biografia: updatedUser.biografia,
        role: updatedUser.id_rol,
        profile_image: updatedUser.profile_image,
        two_factor_enabled: updatedUser.two_factor_enabled,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      return res.status(500).json({
        message: "Error al actualizar perfil",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  static getUserInfo = async (req: Request, res: Response): Promise<void | Response> => {
    const userIdParam = req.params.id;
    if (!userIdParam) {
      res.status(400).json({ message: "ID de usuario requerido" });
      return;
    }

    const userId = parseInt(userIdParam);

    if (isNaN(userId)) {
      res.status(400).json({ message: "ID de usuario inválido" });
      return;
    }

    try {
      const user = await prisma.usuarios.findUnique({
        where: { id_usuario: userId },
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          biografia: true,
          profile_image: true,
          rol: {
            select: {
              nombre: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      return res.status(500).json({
        message: "Error buscando información del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  static login = async (req: Request, res: Response): Promise<void | Response> => {
    const result = safeParse(authSchema, req.body);

    if (!result.success) {
      res.status(400).json({ message: "Bad Request", errors: result.issues });
      return;
    }

    const { email, password } = result.output;

    try {
      const user = await UserModel.findUserByEmail(email);

      if (!user || !(await UserModel.validatePassword(user, password))) {
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }

      if (!user.is_active) {
        res.status(403).json({ message: "Cuenta desactivada. Contacta al administrador." });
        return;
      }

      if (
        ([Rol.ADMIN, Rol.CURADOR] as number[]).includes(user.id_rol) &&
        !user.two_factor_enabled
      ) {
        if (!user.two_factor_secret) {
          const { secret, qrCode } = await UserModel.generate2FASecret(user.id_usuario);
          await send2FASetupEmail(user.email, secret, qrCode);

          res.status(202).json({
            message: "Requiere configuración 2FA",
            requiresSetup: true,
            setupData: { secret, qrCode },
            tempToken: sign(
              { id_usuario: user.id_usuario, setupMode: true },
              config.jwtSecret,
              { expiresIn: config.jwt.tempTokenExpiry }
            ),
          });
        } else {
          const qrCode = await UserModel.regenerateQRCode(
            user.two_factor_secret,
            user.email
          );
          res.status(202).json({
            message: "Requiere configuración 2FA",
            requiresSetup: true,
            setupData: { secret: user.two_factor_secret, qrCode },
            tempToken: sign(
              { id_usuario: user.id_usuario, setupMode: true },
              config.jwtSecret,
              { expiresIn: config.jwt.tempTokenExpiry }
            ),
          });
        }
        return;
      }

      if (
        (([Rol.ADMIN, Rol.CURADOR] as number[]).includes(user.id_rol) &&
          user.two_factor_enabled) ||
        user.two_factor_enabled
      ) {
        res.status(202).json({
          message: "Requiere verificación 2FA",
          requires2FA: true,
          tempToken: sign(
            { id_usuario: user.id_usuario, pending2FA: true },
            config.jwtSecret,
            { expiresIn: config.jwt.pending2FAExpiry }
          ),
        });
        return;
      }

      await UserModel.updateLastLogin(user.id_usuario);

      const accessToken = sign(
        {
          id_usuario: user.id_usuario,
          id_rol: user.id_rol,
          nombre: user.nombre,
        },
        config.jwtSecret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );

      const { token: refresh_tokens } = await UserModel.createRefreshToken(
        user.id_usuario
      );

      res.cookie("refreshToken", refresh_tokens, {
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        user: {
          id_usuario: user.id_usuario,
          email: user.email,
          role: user.id_rol,
          nombre: user.nombre,
          biografia: user.biografia,
          profile_image: user.profile_image,
        },
      });

      res.json({
        accessToken,
        user: {
          id_usuario: user.id_usuario,
          email: user.email,
          role: user.id_rol,
          nombre: user.nombre,
          biografia: user.biografia,
          profile_image: user.profile_image,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error en el inicio de sesión",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  static forgot_password = async (
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    const { email } = req.body;

    try {
      const user = await UserModel.findUserByEmail(email);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const token = await UserModel.generatePasswordResetToken(user.id_usuario);
      await sendPasswordResetEmail(email, token);

      res.json({ message: "Se ha enviado un email con las instrucciones" });
    } catch (error) {
      return res.status(500).json({
        message: "Error al procesar la solicitud",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static reset_password = async (
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    const { token: resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      res
        .status(400)
        .json({ message: "Token y nueva contraseña son requeridos" });
      return;
    }

    const passwordValidation = safeParse(passwordSchema, newPassword);
    if (!passwordValidation.success) {
      res.status(400).json({
        message: "La contraseña no cumple con los requisitos",
        errors: passwordValidation.issues,
      });
      return;
    }

    try {
      const success = await UserModel.resetPassword(resetToken, newPassword);
      if (!success) {
        res.status(400).json({ message: "Token inválido o expirado" });
        return;
      }

      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      return res.status(500).json({
        message: "Error al restablecer la contraseña",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static setup2FA = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const userId = req.user?.id_usuario;
      if (!userId) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const { secret, qrCode } = await UserModel.generate2FASecret(userId);
      const user = await UserModel.findUserByEmail(req.user?.email || "");

      if (user) {
        await send2FASetupEmail(user.email, secret, qrCode);
      }

      const tempToken = sign(
        { id_usuario: userId, setupMode: true },
        config.jwtSecret,
        { expiresIn: config.jwt.tempTokenExpiry }
      );

      res.json({
        message: "2FA configurado correctamente",
        secret,
        qrCode,
        tempToken,
      });
    } catch (error) {
      console.error("Error in setup2FA:", error);
      return res.status(500).json({
        message: "Error al configurar 2FA",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static verify2FA = async (req: Request, res: Response): Promise<void | Response> => {
    const { token } = req.body;
    const userId = req.user?.id_usuario;

    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    try {
      const { isValid, user } = await UserModel.verify2FAToken(userId, token);

      if (!isValid || !user) {
        res.status(400).json({ message: "Código 2FA inválido" });
        return;
      }

      const accessToken = sign(
        {
          id_usuario: user.id_usuario,
          id_rol: user.id_rol,
        },
        config.jwtSecret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );

      const { token: refreshToken } = await UserModel.createRefreshToken(user.id_usuario);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "2FA verificado correctamente",
        accessToken,
        user: {
          id_usuario: user.id_usuario,
          email: user.email,
          role: user.id_rol,
          nombre: user.nombre,
          biografia: user.biografia,
          two_factor_enabled: true,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error al verificar 2FA",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static logout = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const userId = req.user?.id_usuario;
      const refreshToken = req.cookies?.refreshToken;

      if (!userId) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      if (refreshToken) {
        await UserModel.revokeRefreshToken(refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.json({ message: "Successfully logged out" });
    } catch (error) {
      return res.status(500).json({
        message: "Logout failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  static refresh = async (req: Request, res: Response): Promise<void | Response> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token requerido" });
      return;
    }

    try {
      const user = await UserModel.findUserByRefreshToken(refreshToken);

      if (!user) {
        await UserModel.revokeRefreshToken(refreshToken);
        res.status(403).json({ message: "Refresh token inválido o expirado" });
        return;
      }

      if (
        ([Rol.ADMIN, Rol.CURADOR] as number[]).includes(user.id_rol) &&
        !user.two_factor_enabled
      ) {
        res.status(403).json({
          message: "2FA requerido pero no configurado",
          requires2FA: true,
        });
        return;
      }

      const newAccessToken = sign(
        {
          id_usuario: user.id_usuario,
          id_rol: user.id_rol,
          nombre: user.nombre,
        },
        config.jwtSecret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );

      await UserModel.revokeRefreshToken(refreshToken);
      const { token: newRefreshToken } = await UserModel.createRefreshToken(
        user.id_usuario
      );

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      await UserModel.revokeRefreshToken(refreshToken);
      return res.status(403).json({
        message: "Error al refrescar token",
        error: errorMessage,
      });
    }
  };
}
