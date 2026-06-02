import prisma from '@app/lib/prisma';
import DeepgramClient from '@deepgram/sdk';
import config from '@config';

export class TranscripcionService {

  async transcribirArchivo(url: string, testimonioId: number, usuarioId: number) {
    try {
      const deepgram = new DeepgramClient({ key: config.deepgramApiKey });

      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url },
        {
          model: 'nova-3',
          language: 'es',
          punctuate: true,
          smart_format: true,
        }
      );

      if (error || !result) {
        throw new Error(error?.message || 'Error al transcribir el archivo');
      }

      const channel = result.results.channels[0];
      const transcript = channel.alternatives[0].transcript;
      const detectedLanguage = channel.detected_language || 'es';

      const transcripcion = await prisma.transcripciones.create({
        data: {
          contenido: transcript,
          idioma: detectedLanguage,
          id_testimonio: testimonioId,
          creado_por_id_usuario: usuarioId,
        },
      });

      return {
        success: true,
        data: transcripcion,
        metadata: {
          duracion: result.metadata.duration,
          canales: result.metadata.channels,
          formato: 'audio',
        },
      };
    } catch (error) {
      throw error;
    }
  }

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