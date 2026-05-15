import express from 'express';
import type { RequestHandler } from 'express';
import { ForoComentarioController } from '../controllers/forocomentario.controller';
import { authenticateToken } from '@app/middleware/authentication';
import { optionalAuth } from '@app/middleware/optionalAuth';
import { logActivity } from '@app/middleware/activityLog';

export const forocomentarioRouter = express.Router();

forocomentarioRouter.use(logActivity);
forocomentarioRouter.get('/', optionalAuth, ForoComentarioController.getAll as RequestHandler);
forocomentarioRouter.get('/tema/:temaId', optionalAuth, ForoComentarioController.getByTemaId as RequestHandler);
forocomentarioRouter.get('/:id', optionalAuth, ForoComentarioController.getById as RequestHandler);
forocomentarioRouter.post('/', authenticateToken, ForoComentarioController.create as RequestHandler);
forocomentarioRouter.put('/:id', authenticateToken, ForoComentarioController.update as RequestHandler);
forocomentarioRouter.delete('/:id', authenticateToken, ForoComentarioController.delete as RequestHandler);