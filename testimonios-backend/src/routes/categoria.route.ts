import express from 'express';
import type { RequestHandler } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { authenticateToken } from '@app/middleware/authentication';
import { authorizeRoles, Rol } from '@app/middleware/authorization';

export const categoriaRouter = express.Router();

categoriaRouter.get('/', CategoriaController.getAll as RequestHandler);
categoriaRouter.get('/:id', CategoriaController.getById as RequestHandler);
categoriaRouter.post('/', authenticateToken, authorizeRoles(Rol.ADMIN, Rol.CURADOR), CategoriaController.create as RequestHandler);
categoriaRouter.put('/:id', authenticateToken, authorizeRoles(Rol.ADMIN, Rol.CURADOR), CategoriaController.update as RequestHandler);
categoriaRouter.delete('/:id', authenticateToken, authorizeRoles(Rol.ADMIN), CategoriaController.delete as RequestHandler);