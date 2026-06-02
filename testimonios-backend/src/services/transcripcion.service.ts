import prisma from '@app/lib/prisma';

export class TranscripcionService {
  
  /**
   * Obtiene una transcripción específica por su ID único.
   */
  async obtenerTranscripcion(id: number) {
    try {
      const transcripcion = await prisma.transcripciones.findUnique({
        where: { id_transcripcion: id },
        include: {
          testimonios: true,
          usuarios: true,
        },
      });

      if (!transcripcion) {
        throw new Error('Transcripción no encontrada');
      }

      return {
        success: true,
        data: transcripcion,
      };
    } catch (error) {
      throw error;
    }
  }


  async obtenerTranscripcionesPorTestimonio(testimonioId: number) {
    try {
      const transcripciones = await prisma.transcripciones.findMany({
        where: { id_testimonio: testimonioId },
        include: {
          usuarios: true,
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return {
        success: true,
        data: transcripciones,
      };
    } catch (error) {
      throw error;
    }
  }
}