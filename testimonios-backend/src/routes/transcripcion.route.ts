import { Router } from 'express';
import type { RequestHandler } from 'express';
import { TranscripcionController } from '../controllers/transcripcion.controller';
import { authenticateToken } from '@app/middleware/authentication';
import { logActivity } from '@app/middleware/activityLog';

export const transcripcionRouter = Router();
const transcripcionController = new TranscripcionController();

transcripcionRouter.use(authenticateToken);

transcripcionRouter.use(logActivity);
transcripcionRouter.post(
  '/:testimonioId/transcribir',
  transcripcionController.transcribirArchivo as unknown as RequestHandler
);
transcripcionRouter.get(
  '/transcripciones/:id',
  transcripcionController.obtenerTranscripcion as unknown as RequestHandler
);
transcripcionRouter.get(
  '/:testimonioId/transcripciones',
  transcripcionController.obtenerTranscripcionesPorTestimonio as unknown as RequestHandler
);
