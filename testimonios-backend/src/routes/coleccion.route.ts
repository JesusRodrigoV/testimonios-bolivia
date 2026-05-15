import express from 'express';
import type { RequestHandler } from 'express';
import { ColeccionController } from '../controllers/coleccion.controller';
import { authenticateToken } from '@app/middleware/authentication';

export const coleccionRouter = express.Router();

coleccionRouter.get('/favorite-count/:id', ColeccionController.getFavoriteCount as unknown as RequestHandler);
coleccionRouter.post('/favorites/toggle/:testimonioId', authenticateToken, ColeccionController.toggleFavorite as unknown as RequestHandler);

coleccionRouter.use(authenticateToken);

coleccionRouter.get('/', ColeccionController.getAll as unknown as RequestHandler);
coleccionRouter.get('/favorites/ids', ColeccionController.getFavoriteTestimonyIds as unknown as RequestHandler);
coleccionRouter.get('/favorites-id', ColeccionController.getFavoritesCollectionId as unknown as RequestHandler);
coleccionRouter.get('/:id', ColeccionController.getById as unknown as RequestHandler);
coleccionRouter.post('/', ColeccionController.create as unknown as RequestHandler);
coleccionRouter.post('/testimonios', ColeccionController.addTestimonio as unknown as RequestHandler);
coleccionRouter.put('/:id', ColeccionController.update as unknown as RequestHandler);
coleccionRouter.delete('/:id', ColeccionController.delete as unknown as RequestHandler);
coleccionRouter.delete('/:id_coleccion/testimonios/:id_testimonio', ColeccionController.removeTestimonio as unknown as RequestHandler);
coleccionRouter.get('/:id/testimonios', ColeccionController.getTestimonios as unknown as RequestHandler);