import { compare, hash } from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import {
  email,
  maxLength,
  minLength,
  nullable,
  number,
  object,
  optional,
  pipe,
  string,
  type InferInput,
} from "valibot";
import type { rol, usuarios } from "../../generated/prisma";
import prisma from "@app/lib/prisma";
import { Rol } from "@app/middleware/authorization";
import config from "@config";

const emailSchema = pipe(
  string(),
  email(),
  maxLength(50, "El email no debe tener mas de 50 caracteres"),
);
export const passwordSchema = pipe(
  string(),
  minLength(6, "Contraseña de al menos 6 caracteres"),
  maxLength(255, "La contraseña no puede tener mas de 255 caracteres"),
);
const nombreSchema = pipe(
  string(),
  minLength(3, "El nombre no puede tener menos de 3 caracteres"),
  maxLength(20, "El nombre no puede tener mas de 20 caracteres"),
);
const biografiaSchema = pipe(nullable(string(), "Sin informacion"));

export const userSchema = object({
  nombre: nombreSchema,
  email: emailSchema,
  password: passwordSchema,
  biografia: biografiaSchema,
});

export const updateUserSchema = object({
  id_usuario: pipe(number()),
  nombre: optional(nombreSchema),
  email: optional(emailSchema),
  id_rol: optional(pipe(number())),
  biografia: optional(biografiaSchema),
  profile_image: optional(string()),
});

export const authSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export const twoFactorSchema = object({
  email: emailSchema,
  password: passwordSchema,
  twoFactorToken: string(),
});


export type UserInput = InferInput<typeof userSchema>;
export type UpdateUserInput = InferInput<typeof updateUserSchema>;

export type User = usuarios & {
  rol?: rol;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class UserModel {
  static createUser = async ({
  email,
  password,
  nombre,
  biografia = "",
  id_rol = Rol.VISITANTE,
}: UserInput & { id_rol?: number }): Promise<User> => {
  const hashedPassword = await hash(password, config.saltRounds);

  return prisma.$transaction(async (tx) => {
    const user = await tx.usuarios.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        biografia: biografia || "",
        id_rol,
        two_factor_secret: "",
        last_login: new Date(),
        two_factor_enabled: false,
      },
      include: {
        rol: true,
      },
    });

    await tx.colecciones.create({
      data: {
        titulo: "Favoritos",
        descripcion: "Testimonios favoritos",
        fecha_creacion: new Date(),
        id_usuario: user.id_usuario,
      },
    });

    await tx.colecciones.create({
      data: {
        titulo: "Guardados",
        descripcion: "Testimonios guardados",
        fecha_creacion: new Date(),
        id_usuario: user.id_usuario,
      },
    });

    return user;
  });
};

static updateUser = async (
  id: number,
  data: Partial<Omit<UserInput, "password">> & {
    password?: string;
    id_rol?: number;
  },
): Promise<User> => {
  const updateData: Record<string, unknown> = { ...data };

  if (data.password) {
    updateData.password = await hash(data.password, config.saltRounds);
  }

  return prisma.usuarios.update({
    where: { id_usuario: id },
    data: updateData,
    include: {
      rol: true,
    },
  });
};

static deleteUser = async (id: number): Promise<void> => {
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: id },
    select: { email: true },
  });
  if (!user) return;

  const timestamp = Date.now();
  const [localPart, domain] = user.email.split('@');
  const deletedEmail = `deleted_${timestamp}_${localPart}@${domain}`;

  await prisma.usuarios.update({
    where: { id_usuario: id },
    data: { is_active: false, email: deletedEmail },
  });
};

static findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.usuarios.findFirst({
    where: { email },
    include: {
      rol: true,
    },
  });
};

static generate2FASecret = async (
  userId: number,
): Promise<{ secret: string; qrCode: string }> => {
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: userId },
    select: { email: true },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const secret = speakeasy.generateSecret({ length: 20 });

  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: user.email,
    issuer: "TestimoniosApp",
    encoding: "base32",
  });

  const qrCode = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 400,
    scale: 4,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  await prisma.usuarios.update({
    where: { id_usuario: userId },
    data: {
      two_factor_secret: secret.base32,
    },
  });

  return {
    secret: secret.base32,
    qrCode,
  };
};

static verify2FAToken = async (
  userId: number,
  token: string,
): Promise<{ isValid: boolean; user: User | null }> => {
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: userId },
    include: {
      rol: true,
    },
  });

  if (!user?.two_factor_secret) {
    return { isValid: false, user: null };
  }

  const currentToken = speakeasy.totp({
    secret: user.two_factor_secret,
    encoding: "base32",
  });

  const isValid = speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: "base32",
    token,
    window: 1,
  });


  if (isValid) {
    await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: {
        two_factor_enabled: true,
        last_login: new Date(),
      },
    });
  }

  return { isValid, user: isValid ? user : null };
};

static regenerateQRCode = async (
  secret: string,
  email: string,
): Promise<string> => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret,
    label: email,
    issuer: "TestimoniosApp",
    encoding: "base32",
  });

  const qrCode = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 400,
    scale: 4,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return qrCode;
};

static generatePasswordResetToken = async (userId: number) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); 

  try {
    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: {
        password_reset_token: token,
        password_reset_expires: expires,
      },
    });

    return token;
  } catch (error) {
    throw error;
  }
};

static resetPassword = async (
  token: string,
  newPassword: string,
): Promise<boolean> => {
  const now = new Date();

  const user = await prisma.usuarios.findFirst({
    where: {
      password_reset_token: token,
      password_reset_expires: {
        gt: now,
      },
    },
  });

  if (!user) return false;

  const hashedPassword = await hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.usuarios.update({
        where: { id_usuario: user.id_usuario },
        data: {
          password: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
        },
      });
      await tx.refresh_tokens.deleteMany({
        where: { id_usuario: user.id_usuario },
      });
    });

  return true;
};

static validatePassword = async (
  user: User,
  password: string,
): Promise<boolean> => {
  return compare(password, user.password);
};

static createRefreshToken = async (
  id_usuario: number,
): Promise<{ token: string; expiresAt: Date }> => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refresh_tokens.create({
    data: {
      id_usuario,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
};

static findUserByRefreshToken = async (
  token: string,
): Promise<User | null> => {
  const refreshToken = await prisma.refresh_tokens.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      usuario: {
        include: {
          rol: true,
        },
      },
    },
  });

  return refreshToken?.usuario || null;
};

static revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refresh_tokens.deleteMany({
    where: { token },
  });
};

static revokeAllRefreshTokens = async (id_usuario: number): Promise<void> => {
  await prisma.refresh_tokens.deleteMany({
    where: { id_usuario },
  });
};

static updateLastLogin = async (userId: number): Promise<void> => {
  await prisma.usuarios.update({
    where: { id_usuario: userId },
    data: { last_login: new Date() },
  });
};

  static getUserRole = async (userId: number): Promise<number> => {
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
      select: { id_rol: true },
    });
    return user?.id_rol || Rol.VISITANTE;
  }
}
