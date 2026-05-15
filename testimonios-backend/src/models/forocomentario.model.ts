import prisma from "@app/lib/prisma";
import { buildCommentTree, sortCommentsByDate } from "../utils/commentTree";
import { getPaginationParams, paginatedResponse, type PaginatedResponse, type PaginationParams } from "@app/utils/pagination";
import type { Request } from "express";

const usuarioSelect = {
  id_usuario: true,
  nombre: true,
  email: true,
  profile_image: true,
  rol: { select: { nombre: true } },
} as const;

export class ForoComentarioModel {
  static async findAll(req: Request): Promise<PaginatedResponse<unknown>> {
    const params = getPaginationParams(req.query);

    const [data, total] = await Promise.all([
      prisma.foro_comentarios.findMany({
        where: { is_active: true },
        include: { usuarios: { select: usuarioSelect } },
        orderBy: { fecha_creacion: "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.foro_comentarios.count({ where: { is_active: true } }),
    ]);

    return paginatedResponse(data, total, params);
  }

  static async findById(id: number) {
    return prisma.foro_comentarios.findUnique({
      where: { id_forocoment: id, is_active: true },
      include: { usuarios: { select: usuarioSelect } },
    });
  }

  static async findByTemaId(temaId: number, req: Request): Promise<PaginatedResponse<unknown>> {
    const params = getPaginationParams(req.query);
    const sort = (req.query.sort as string) === 'oldest' ? 'oldest' : 'newest';
    const orderDir = sort === 'oldest' ? 'asc' : 'desc';

    const totalRoots = await prisma.foro_comentarios.count({
      where: { id_forotema: temaId, parent_id: null, is_active: true },
    });

    const rootComments = await prisma.foro_comentarios.findMany({
      where: { id_forotema: temaId, parent_id: null, is_active: true },
      include: { usuarios: { select: usuarioSelect } },
      orderBy: { fecha_creacion: orderDir },
      skip: params.skip,
      take: params.limit,
    });

    if (rootComments.length === 0) {
      return paginatedResponse([], totalRoots, params);
    }

    const rootIds = rootComments.map((c) => c.id_forocoment);

    const childComments = await prisma.foro_comentarios.findMany({
      where: {
        id_forotema: temaId,
        parent_id: { not: null },
        is_active: true,
      },
      include: { usuarios: { select: usuarioSelect } },
    });

    const allComments = [...rootComments, ...childComments];
    const commentTree = sortCommentsByDate(buildCommentTree(allComments), sort);

    const filteredTree = commentTree.filter((c) => rootIds.includes(c.id_forocoment));

    return paginatedResponse(filteredTree, totalRoots, params);
  }

  static async create(data: {
    contenido: string;
    creado_por_id_usuario: number;
    id_forotema: number;
    parent_id?: number;
  }) {
    return prisma.foro_comentarios.create({
      data: { ...data, fecha_creacion: new Date() },
      include: { usuarios: { select: usuarioSelect } },
    });
  }

  static async update(id: number, data: { contenido?: string }) {
    return prisma.foro_comentarios.update({
      where: { id_forocoment: id },
      data,
      include: { usuarios: { select: usuarioSelect } },
    });
  }

  static async softDelete(id: number) {
    await prisma.foro_comentarios.updateMany({
      where: { parent_id: id, is_active: true },
      data: { is_active: false },
    });
    return prisma.foro_comentarios.update({
      where: { id_forocoment: id },
      data: { is_active: false },
    });
  }
}
