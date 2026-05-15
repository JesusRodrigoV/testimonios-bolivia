import type { Request, Response } from 'express';
import { TranscripcionService } from '../services/transcripcion.service';
import prisma from '@app/lib/prisma';

export class TranscripcionController {
  private transcripcionService: TranscripcionService;

  constructor() {
    this.transcripcionService = new TranscripcionService();
  }

  transcribirArchivo = async (req: Request, res: Response): Promise<void | Response> => { // transcribir un archivo desde la url del testimonio
    try {
      const { testimonioId } = req.params;
      const usuarioId = req.user?.id_usuario;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const testimonio = await prisma.testimonios.findUnique({
        where: { id_testimonio: Number(testimonioId) }
      });

      if (!testimonio) {
        res.status(404).json({
          success: false,
          message: 'Testimonio no encontrado'
        });
        return;
      }

      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: usuarioId },
        select: { id_rol: true },
      });

      if (testimonio.subido_por !== usuarioId && usuario?.id_rol !== undefined && usuario.id_rol > 2) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para transcribir este testimonio.'
        });
        return;
      }

      const resultado = await this.transcripcionService.transcribirArchivo(
        testimonio.url_medio,
        Number(testimonioId),
        usuarioId
      );

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en el controlador de transcripción:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la transcripción'
      });
    }
  };

  obtenerTranscripcion = async (req: Request, res: Response): Promise<void | Response> => { // obtener una transcripción por id
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id_usuario;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const resultado = await this.transcripcionService.obtenerTranscripcion(
        Number(id)
      );

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener la transcripción:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener la transcripción'
      });
    }
  };

  obtenerTranscripcionesPorTestimonio = async ( // obtener todas las transcripciones de un testimonio
    req: Request,
    res: Response
  ): Promise<void | Response> => {
    try {
      const { testimonioId } = req.params;
      const usuarioId = req.user?.id_usuario;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const resultado =
        await this.transcripcionService.obtenerTranscripcionesPorTestimonio(
          Number(testimonioId)
        );

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener las transcripciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las transcripciones'
      });
    }
  };
}
