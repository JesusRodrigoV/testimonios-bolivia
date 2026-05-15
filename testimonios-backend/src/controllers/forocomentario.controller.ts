import type { Request, Response } from 'express';
import { parse, ValiError } from "valibot";
import { ForoComentarioModel } from '../models/forocomentario.model';
import { NotificacionModel } from '../models/notificacion.model';
import { createForoComentarioSchema } from '../validators/foro.validator';
import type { CustomJwtPayload } from '../middleware/authentication';
import { Rol } from '../middleware/authorization';
import prisma from '@app/lib/prisma';

export class ForoComentarioController {
  static async getAll(req: Request, res: Response) {
    try {
      const result = await ForoComentarioModel.findAll(req);
      res.json(result);
    } catch (error) {
      console.error('Error al obtener comentarios del foro:', error);
      return res.status(500).json({ error: 'Error al obtener los comentarios del foro' });
    }
  }

  static async getByTemaId(req: Request, res: Response) {
    try {
      const temaId = parseInt(req.params.temaId!);
      if (isNaN(temaId)) {
        return res.status(400).json({ error: 'ID del tema inválido' });
      }

      const tema = await prisma.foro_temas.findUnique({
        where: { id_forotema: temaId, is_active: true },
      });

      if (!tema) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      const result = await ForoComentarioModel.findByTemaId(temaId, req);
      res.json(result);
    } catch (error) {
      console.error('Error al obtener comentarios del tema:', error);
      return res.status(500).json({ error: 'Error al obtener los comentarios del tema' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const comentario = await ForoComentarioModel.findById(id);
      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      res.json(comentario);
    } catch (error) {
      console.error('Error al obtener comentario del foro:', error);
      return res.status(500).json({ error: 'Error al obtener el comentario del foro' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const user = req.user as CustomJwtPayload;

      const body = parse(createForoComentarioSchema, req.body);

      const tema = await prisma.foro_temas.findUnique({
        where: { id_forotema: body.id_forotema, is_active: true },
      });
      if (!tema) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      if (body.parent_id) {
        const comentarioPadre = await prisma.foro_comentarios.findUnique({
          where: { id_forocoment: body.parent_id, is_active: true },
          select: { id_forocoment: true },
        });
        if (!comentarioPadre) {
          return res.status(404).json({ error: 'Comentario padre no encontrado' });
        }
      }

      const comentario = await ForoComentarioModel.create({
        contenido: body.contenido,
        creado_por_id_usuario: user.id_usuario,
        id_forotema: body.id_forotema,
        parent_id: body.parent_id,
      });

      // Notificar al autor del topic o comentario padre
      try {
        if (body.parent_id) {
          const parent = await prisma.foro_comentarios.findUnique({
            where: { id_forocoment: body.parent_id },
            select: { creado_por_id_usuario: true },
          });
          if (parent) {
            await NotificacionModel.notificarNuevaRespuestaForo({
              id_topic: body.id_forotema,
              id_comment: body.parent_id,
              id_destinatario: parent.creado_por_id_usuario,
              id_remitente: user.id_usuario,
              mensaje: `${user.nombre} respondió a tu comentario en el foro`,
            });
          }
        } else {
          const topic = await prisma.foro_temas.findUnique({
            where: { id_forotema: body.id_forotema },
            select: { creado_por_id_usuario: true },
          });
          if (topic) {
            await NotificacionModel.notificarNuevaRespuestaForo({
              id_topic: body.id_forotema,
              id_destinatario: topic.creado_por_id_usuario,
              id_remitente: user.id_usuario,
              mensaje: `${user.nombre} respondió a tu tema en el foro`,
            });
          }
        }
      } catch (err) {
        console.error("Error al notificar respuesta en foro:", err);
      }

      res.status(201).json(comentario);
    } catch (error) {
      if (error instanceof ValiError) {
        return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
      }
      console.error('Error al crear comentario del foro:', error);
      return res.status(500).json({ error: 'Error al crear el comentario en el foro' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const user = req.user as CustomJwtPayload;
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const comentario = await ForoComentarioModel.findById(id);
      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      if (comentario.creado_por_id_usuario !== user.id_usuario) {
        return res.status(403).json({
          error: 'No tienes permiso para modificar este comentario. Solo el creador puede modificarlo.'
        });
      }

      const { contenido } = req.body;
      if (!contenido) {
        return res.status(400).json({ error: 'El contenido es requerido' });
      }

      const updatedComentario = await ForoComentarioModel.update(id, { contenido });
      res.json(updatedComentario);
    } catch (error) {
      console.error('Error al actualizar comentario del foro:', error);
      return res.status(500).json({ error: 'Error al actualizar el comentario del foro' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const user = req.user as CustomJwtPayload;
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const comentario = await ForoComentarioModel.findById(id);
      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      if (comentario.creado_por_id_usuario !== user.id_usuario && user.id_rol !== Rol.ADMIN) {
        return res.status(403).json({
          error: 'No tienes permiso para eliminar este comentario. Solo el creador o un admin pueden eliminarlo.'
        });
      }

      await ForoComentarioModel.softDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar comentario del foro:', error);
      return res.status(500).json({ error: 'Error al eliminar el comentario del foro' });
    }
  }
}
