import { maxValue, minValue, number, object, pipe } from "valibot";
import config from "@config";
import prisma from "@app/lib/prisma";
import { sseManager } from "@app/lib/sse-manager";

const NOTIFICATION_INCLUDE = {
  testimonios: { select: { titulo: true } },
  estado: { select: { nombre: true } },
  forotema: { select: { titulo: true } },
} as const;

export const cambiarEstadoSchema = object({
  id_estado: pipe(number(), minValue(1, "Estado inválido"), maxValue(3, "Estado inválido")),
});

export class NotificacionModel {
  static async findAll() {
    return prisma.notificaciones.findMany({
      where: { is_active: true },
      include: NOTIFICATION_INCLUDE
    });
  }

  static async findByUsuario(id_usuario: number) {
    return prisma.notificaciones.findMany({
      where: { id_usuario, is_active: true },
      include: NOTIFICATION_INCLUDE,
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 50,
    });
  }

  static async findUnreadByUsuario(id_usuario: number) {
    return prisma.notificaciones.findMany({
      where: { 
        id_usuario,
        leido: false,
        is_active: true,
      },
      include: NOTIFICATION_INCLUDE,
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 50,
    });
  }

  static async findById(id: number) {
    return prisma.notificaciones.findUnique({
      where: { id_notificacion: id },
      include: NOTIFICATION_INCLUDE
    });
  }

  static async create(data: {
    mensaje: string;
    id_testimonio?: number | null;
    id_estado?: number | null;
    id_usuario: number;
    id_forotema?: number | null;
    id_forocoment?: number | null;
    id_remitente?: number | null;
  }) {
    const notificacion = await prisma.notificaciones.create({
      data: {
        ...data,
        fecha_creacion: new Date(),
        leido: false
      },
      include: NOTIFICATION_INCLUDE
    });

    sseManager.sendToUser(data.id_usuario, {
      type: "new_notification",
      notification: notificacion,
    });

    return notificacion;
  }

  static async notificarNuevoTestimonio(id_testimonio: number) {
    const usuarios = await prisma.usuarios.findMany({
      where: {
        id_rol: {
          in: [config.roles.admin, config.roles.curador]
        },
        is_active: true,
      }
    });

    const notificaciones = await Promise.all(
      usuarios.map(usuario =>
        this.create({
          mensaje: "Se ha subido un nuevo testimonio para revisión",
          id_testimonio,
          id_estado: 1,
          id_usuario: usuario.id_usuario
        })
      )
    );

    return notificaciones;
  }

  static async notificarCambioEstadoTestimonio(
    id_testimonio: number,
    id_usuario: number,
    id_estado: number,
    titulo_testimonio: string
  ) {

    var mensaje = "";
    switch (id_estado) {
      case 1:
        mensaje = `Tu testimonio "${titulo_testimonio}" ha sido enviado para revisión`
        break;
      case 2:
        mensaje = `Tu testimonio "${titulo_testimonio}" ha sido aprobado`
        break;
      case 3:
        mensaje = `Tu testimonio "${titulo_testimonio}" ha sido rechazado`;
        break;
    }


    return this.create({
      mensaje,
      id_testimonio,
      id_estado,
      id_usuario
    });
  }

  static async notificarNuevoComentario(id_testimonio: number) {
    const usuarios = await prisma.usuarios.findMany({
      where: {
        id_rol: config.roles.admin,
        is_active: true,
      }
    });

    const notificaciones = await Promise.all(
      usuarios.map(usuario =>
        this.create({
          mensaje: "Se ha creado un nuevo comentario pendiente de aprobación",
          id_testimonio,
          id_estado: 1,
          id_usuario: usuario.id_usuario
        })
      )
    );

    return notificaciones;
  }

  static async notificarCambioEstadoComentario(
    id_testimonio: number,
    id_usuario: number,
    id_estado: number
  ) {
    let mensaje = "";
    switch (id_estado) {
      case 2:
        mensaje = "Tu comentario ha sido aprobado";
        break;
      case 3:
        mensaje = "Tu comentario ha sido rechazado";
        break;
    }

    return this.create({
      mensaje,
      id_testimonio,
      id_estado,
      id_usuario
    });
  }

  static async notificarNuevaRespuestaForo(params: {
    id_topic: number;
    id_comment?: number;
    id_destinatario: number;
    id_remitente: number;
    mensaje: string;
  }) {
    if (params.id_remitente === params.id_destinatario) return null;

    return this.create({
      mensaje: params.mensaje,
      id_usuario: params.id_destinatario,
      id_forotema: params.id_topic,
      id_forocoment: params.id_comment ?? null,
      id_remitente: params.id_remitente,
    });
  }

  static async marcarComoLeido(id: number) {
    return prisma.notificaciones.update({
      where: { id_notificacion: id },
      data: { leido: true },
      include: NOTIFICATION_INCLUDE
    });
  }

  static async marcarTodasComoLeidas(id_usuario: number) {
    return prisma.notificaciones.updateMany({
      where: { id_usuario, leido: false, is_active: true },
      data: { leido: true },
    });
  }

  static async delete(id: number) {
    return prisma.notificaciones.update({
      where: { id_notificacion: id },
      data: { is_active: false }
    });
  }

  static async cambiarEstado(id: number, id_estado: number) {
    return prisma.notificaciones.update({
      where: { id_notificacion: id },
      data: { id_estado },
      include: NOTIFICATION_INCLUDE
    });
  }
}