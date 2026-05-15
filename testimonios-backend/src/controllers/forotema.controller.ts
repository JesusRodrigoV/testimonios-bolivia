import type { Request, Response } from 'express';
import { parse, ValiError } from "valibot";
import { ForoTemaModel, updateForoTemaSchema } from '../models/forotema.model';
import { createForoTemaSchema } from '../validators/foro.validator';
import type { CustomJwtPayload } from '../middleware/authentication';
import { Rol } from '../middleware/authorization';
import prisma from '@app/lib/prisma';

export class ForoTemaController {
  static async getAll(req: Request, res: Response) {
    try {
      const result = await ForoTemaModel.findAll(req);
      res.json(result);
    } catch (error) {
      console.error('Error al obtener temas del foro:', error);
      return res.status(500).json({ error: 'Error al obtener los temas del foro' });
    }
  }

  static async getMyTopics(req: Request, res: Response) {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const user = req.user as CustomJwtPayload;
      const result = await ForoTemaModel.findByUserId(user.id_usuario, req);
      res.json(result);
    } catch (error) {
      console.error('Error al obtener mis temas del foro:', error);
      return res.status(500).json({ error: 'Error al obtener mis temas del foro' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const forotema = await ForoTemaModel.findById(id);
      if (!forotema || !forotema.is_active) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }
      res.json(forotema);
    } catch (error) {
      console.error('Error al obtener tema del foro:', error);
      return res.status(500).json({ error: 'Error al obtener el tema del foro' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }
      const user = req.user as CustomJwtPayload;

      const body = parse(createForoTemaSchema, req.body);

      if (!body.id_testimonio && !body.id_evento) {
        return res.status(400).json({
          error: 'Debe proporcionar al menos un testimonio o un evento histórico'
        });
      }

      if (body.id_testimonio) {
        const testimonio = await prisma.testimonios.findUnique({
          where: { id_testimonio: body.id_testimonio }
        });
        if (!testimonio) {
          return res.status(400).json({ error: 'El testimonio especificado no existe' });
        }
      }

      if (body.id_evento) {
        const evento = await prisma.eventos_historicos.findUnique({
          where: { id_evento: body.id_evento }
        });
        if (!evento) {
          return res.status(400).json({ error: 'El evento histórico especificado no existe' });
        }
      }

      const forotema = await ForoTemaModel.create({
        titulo: body.titulo,
        descripcion: body.descripcion,
        creado_por_id_usuario: user.id_usuario,
        id_evento: body.id_evento,
        id_testimonio: body.id_testimonio,
      });
      res.status(201).json(forotema);
    } catch (error) {
      if (error instanceof ValiError) {
        return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
      }
      console.error('Error al crear tema del foro:', error);
      return res.status(500).json({ error: 'Error al crear el tema en el foro' });
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

      const forotema = await ForoTemaModel.findById(id);
      if (!forotema || !forotema.is_active) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      if (forotema.creado_por_id_usuario !== user.id_usuario) {
        return res.status(403).json({
          error: 'No tienes permiso para modificar este tema. Solo el creador puede modificarlo.'
        });
      }

      const { titulo, descripcion, id_evento, id_testimonio } = parse(updateForoTemaSchema, req.body);

      if (!id_testimonio && !id_evento) {
        return res.status(400).json({
          error: 'Debe proporcionar al menos un testimonio o un evento histórico'
        });
      }

      if (id_testimonio) {
        const testimonio = await prisma.testimonios.findUnique({
          where: { id_testimonio }
        });
        if (!testimonio) {
          return res.status(400).json({ error: 'El testimonio especificado no existe' });
        }
      }

      if (id_evento) {
        const evento = await prisma.eventos_historicos.findUnique({
          where: { id_evento }
        });
        if (!evento) {
          return res.status(400).json({ error: 'El evento histórico especificado no existe' });
        }
      }

      const updatedForotema = await ForoTemaModel.update(id, {
        titulo, descripcion, id_evento, id_testimonio
      });
      res.json(updatedForotema);
    } catch (error) {
      if (error instanceof ValiError) {
        return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
      }
      console.error('Error al actualizar tema del foro:', error);
      return res.status(500).json({ error: 'Error al actualizar el tema del foro' });
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

      const forotema = await ForoTemaModel.findById(id);
      if (!forotema || !forotema.is_active) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      if (forotema.creado_por_id_usuario !== user.id_usuario && user.id_rol !== Rol.ADMIN) {
        return res.status(403).json({
          error: 'No tienes permiso para eliminar este tema. Solo el creador o un admin pueden eliminarlo.'
        });
      }

      await ForoTemaModel.softDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar tema del foro:', error);
      return res.status(500).json({ error: 'Error al eliminar el tema del foro' });
    }
  }
}
