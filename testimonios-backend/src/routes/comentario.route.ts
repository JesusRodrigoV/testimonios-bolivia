import express from 'express';
import type { RequestHandler } from 'express';
import { ComentarioController } from '../controllers/comentario.controller';
import { authenticateToken } from '@app/middleware/authentication';
import { optionalAuth } from '@app/middleware/optionalAuth';
import { authorizeRoles, Rol } from '@app/middleware/authorization';

export const comentarioRouter = express.Router();

comentarioRouter.get('/', optionalAuth, ComentarioController.getAll as RequestHandler);
comentarioRouter.get('/pending', authenticateToken, authorizeRoles(Rol.ADMIN), ComentarioController.getPendingComments as RequestHandler);
comentarioRouter.get('/testimonio/:id_testimonio', optionalAuth, ComentarioController.getByTestimonioId as RequestHandler);
comentarioRouter.get('/:id', optionalAuth, ComentarioController.getById as RequestHandler);
comentarioRouter.post('/', authenticateToken, ComentarioController.create as RequestHandler);
comentarioRouter.put('/:id', authenticateToken, ComentarioController.update as RequestHandler);
comentarioRouter.delete('/:id', authenticateToken, ComentarioController.delete as RequestHandler);
comentarioRouter.post('/:id/like', authenticateToken, ComentarioController.likeComment as RequestHandler);
comentarioRouter.delete('/:id/like', authenticateToken, ComentarioController.unlikeComment as RequestHandler);
