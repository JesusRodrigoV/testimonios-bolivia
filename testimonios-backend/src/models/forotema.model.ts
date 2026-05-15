import { maxLength, minLength, number, object, optional, pipe, string } from "valibot";
import prisma from "@app/lib/prisma";
import { getPaginationParams, paginatedResponse, type PaginatedResponse, type PaginationParams } from "@app/utils/pagination";
import type { Request } from "express";

export const updateForoTemaSchema = object({
  titulo: optional(pipe(string(), minLength(1, "El título es requerido"), maxLength(200, "El título no debe exceder 200 caracteres"))),
  descripcion: optional(pipe(string(), minLength(1, "La descripción es requerida"), maxLength(2000, "La descripción no debe exceder 2000 caracteres"))),
  id_evento: optional(pipe(number())),
  id_testimonio: optional(pipe(number())),
});

const temaIncludes = {
  usuarios: {
    select: {
      id_usuario: true,
      nombre: true,
      profile_image: true,
    },
  },
  eventos_historicos: {
    select: {
      id_evento: true,
      nombre: true,
    },
  },
  testimonios: {
    select: {
      id_testimonio: true,
      titulo: true,
    },
  },
  _count: {
    select: { foro_comentarios: true },
  },
} as const;

export class ForoTemaModel {
  static async findAll(req: Request): Promise<PaginatedResponse<unknown>> {
    const params = getPaginationParams(req.query);

    const [data, total] = await Promise.all([
      prisma.foro_temas.findMany({
        where: { is_active: true },
        include: temaIncludes,
        orderBy: { fecha_creacion: "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.foro_temas.count({ where: { is_active: true } }),
    ]);

    return paginatedResponse(data, total, params);
  }

  static async findById(id: number) {
    return prisma.foro_temas.findUnique({
      where: { id_forotema: id },
      include: {
        ...temaIncludes,
        usuarios: {
          select: {
            id_usuario: true,
            nombre: true,
            email: true,
            profile_image: true,
            rol: { select: { nombre: true } },
          },
        },
      },
    });
  }

  static async findByUserId(userId: number, req: Request): Promise<PaginatedResponse<unknown>> {
    const params = getPaginationParams(req.query);

    const [data, total] = await Promise.all([
      prisma.foro_temas.findMany({
        where: { creado_por_id_usuario: userId, is_active: true },
        include: temaIncludes,
        orderBy: { fecha_creacion: "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.foro_temas.count({
        where: { creado_por_id_usuario: userId, is_active: true },
      }),
    ]);

    return paginatedResponse(data, total, params);
  }

  static async create(data: {
    titulo: string;
    descripcion: string;
    creado_por_id_usuario: number;
    id_evento?: number;
    id_testimonio?: number;
  }) {
    return prisma.foro_temas.create({
      data: { ...data, fecha_creacion: new Date() },
      include: temaIncludes,
    });
  }

  static async update(id: number, data: {
    titulo?: string;
    descripcion?: string;
    id_evento?: number;
    id_testimonio?: number;
  }) {
    return prisma.foro_temas.update({
      where: { id_forotema: id },
      data,
    });
  }

  static async softDelete(id: number) {
    await prisma.foro_comentarios.updateMany({
      where: { id_forotema: id, is_active: true },
      data: { is_active: false },
    });
    return prisma.foro_temas.update({
      where: { id_forotema: id },
      data: { is_active: false },
    });
  }
}
