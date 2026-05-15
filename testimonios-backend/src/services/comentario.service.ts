import prisma from "@app/lib/prisma";
import { getPaginationParams, paginatedResponse, type PaginatedResponse } from "@app/utils/pagination";
import type { Request } from "express";

const comentarioIncludes = {
  usuarios: {
    select: {
      id_usuario: true,
      nombre: true,
      profile_image: true,
      rol: { select: { id_rol: true, nombre: true } },
    },
  },
  replies: {
    where: { id_estado: 2, is_active: true },
    include: {
      usuarios: {
        select: {
          id_usuario: true,
          nombre: true,
          profile_image: true,
          rol: { select: { id_rol: true, nombre: true } },
        },
      },
      likes: { select: { id_usuario: true } },
    },
    orderBy: { fecha_creacion: "asc" as const },
  },
  likes: { select: { id_usuario: true } },
};

export class ComentarioService {
  static async findAll(req?: Request): Promise<unknown[] | PaginatedResponse<unknown>> {
    const where = { is_active: true };
    const params = req ? getPaginationParams(req.query) : null;

    if (params) {
      const [data, total] = await Promise.all([
        prisma.comentarios.findMany({
          where,
          include: { ...comentarioIncludes, replies: false },
          orderBy: { fecha_creacion: "desc" },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.comentarios.count({ where }),
      ]);
      return paginatedResponse(data, total, params);
    }

    return prisma.comentarios.findMany({
      where,
      include: comentarioIncludes,
      orderBy: { fecha_creacion: "desc" },
    });
  }

  static async findApproved(req?: Request): Promise<unknown[] | PaginatedResponse<unknown>> {
    const where = { id_estado: 2, is_active: true };
    const params = req ? getPaginationParams(req.query) : null;

    if (params) {
      const [data, total] = await Promise.all([
        prisma.comentarios.findMany({
          where,
          include: comentarioIncludes,
          orderBy: { fecha_creacion: "desc" },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.comentarios.count({ where }),
      ]);
      return paginatedResponse(data, total, params);
    }

    return prisma.comentarios.findMany({
      where,
      include: comentarioIncludes,
      orderBy: { fecha_creacion: "desc" },
    });
  }

  static async findPending() {
    return prisma.comentarios.findMany({
      where: { id_estado: 1, is_active: true }, // 1 = pendiente
      include: {
        usuarios: {
          select: {
            nombre: true,
            profile_image: true,
            rol: { select: { id_rol: true, nombre: true } },
          },
        },
      },
    });
  }

  static async findByTestimonioId(id_testimonio: number, req?: Request): Promise<any[] | PaginatedResponse<any>> {
    const params = req ? getPaginationParams(req.query) : null;

    const where = { id_testimonio, id_estado: 2, is_active: true, parent_id: null as number | null };

    if (params) {
      const total = await prisma.comentarios.count({ where });

      const rootComments = await prisma.comentarios.findMany({
        where,
        include: {
          usuarios: {
            select: { id_usuario: true, nombre: true, profile_image: true, rol: { select: { id_rol: true, nombre: true } } },
          },
          likes: { select: { id_usuario: true } },
        },
        orderBy: { fecha_creacion: "desc" },
        skip: params.skip,
        take: params.limit,
      });

      if (rootComments.length === 0) {
        return paginatedResponse([], total, params);
      }

      const childComments = await prisma.comentarios.findMany({
        where: {
          id_testimonio,
          id_estado: 2,
          is_active: true,
          parent_id: { not: null },
        },
        include: {
          usuarios: {
            select: { id_usuario: true, nombre: true, profile_image: true, rol: { select: { id_rol: true, nombre: true } } },
          },
          likes: { select: { id_usuario: true } },
        },
        orderBy: { fecha_creacion: "asc" },
      });

      const allForPage = [...rootComments, ...childComments];

      const commentMap = new Map<number, any>();
      const roots: any[] = [];

      for (const comment of allForPage) {
        commentMap.set(comment.id_comentario, { ...comment, replies: [] });
      }

      for (const comment of allForPage) {
        const node = commentMap.get(comment.id_comentario)!;
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          commentMap.get(comment.parent_id)!.replies.push(node);
        } else if (!comment.parent_id) {
          roots.push(node);
        }
      }

      return paginatedResponse(roots, total, params);
    }

    const allComments = await prisma.comentarios.findMany({
      where: { ...where, parent_id: undefined },
      include: {
        usuarios: {
          select: {
            id_usuario: true,
            nombre: true,
            profile_image: true,
            rol: { select: { id_rol: true, nombre: true } },
          },
        },
        likes: { select: { id_usuario: true } },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    const commentMap = new Map<number, any>();
    const roots: any[] = [];

    for (const comment of allComments) {
      commentMap.set(comment.id_comentario, { ...comment, replies: [] });
    }

    for (const comment of allComments) {
      const node = commentMap.get(comment.id_comentario)!;
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        commentMap.get(comment.parent_id)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  static async findById(id: number) {
    return prisma.comentarios.findUnique({
      where: { id_comentario: id },
      include: {
        usuarios: {
          select: {
            nombre: true,
            profile_image: true,
            rol: { select: { id_rol: true, nombre: true } },
          },
        },
        replies: {
          where: { id_estado: 2 },
          include: {
            usuarios: {
              select: {
                nombre: true,
                profile_image: true,
                rol: { select: { id_rol: true, nombre: true } },
              },
            },
            likes: { select: { id_usuario: true } },
          },
        },
        likes: { select: { id_usuario: true } },
      },
    });
  }

  static async create(data: {
    contenido: string;
    id_estado: number;
    fecha_creacion: Date;
    creado_por_id_usuario: number;
    id_testimonio: number;
    parent_id?: number;
  }) {
    return prisma.comentarios.create({
      data,
      include: {
        usuarios: {
          select: {
            nombre: true,
            profile_image: true,
            rol: { select: { id_rol: true, nombre: true } },
          },
        },
        likes: { select: { id_usuario: true } },
      },
    });
  }

  static async update(
    id: number,
    data: {
      contenido?: string;
      id_estado?: number;
    }
  ) {
    return prisma.comentarios.update({
      where: { id_comentario: id },
      data,
      include: {
        usuarios: {
          select: {
            nombre: true,
            profile_image: true,
            rol: { select: { id_rol: true, nombre: true } },
          },
        },
        likes: { select: { id_usuario: true } },
      },
    });
  }

  static async delete(id: number) {
    await prisma.comentarios.updateMany({
      where: { parent_id: id, is_active: true },
      data: { is_active: false },
    });
    return prisma.comentarios.update({
      where: { id_comentario: id },
      data: { is_active: false },
    });
  }

  static async likeComment(id_comentario: number, id_usuario: number) {
    return prisma.likes_comentarios.create({
      data: {
        id_comentario,
        id_usuario,
      },
    });
  }

  static async unlikeComment(id_comentario: number, id_usuario: number) {
    return prisma.likes_comentarios.delete({
      where: {
        id_comentario_id_usuario: {
          id_comentario,
          id_usuario,
        },
      },
    });
  }
}
