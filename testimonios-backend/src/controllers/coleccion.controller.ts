import type { Request, Response } from 'express';
import { parse, ValiError } from "valibot";
import { ColeccionModel, createColeccionSchema, updateColeccionSchema } from '../models/coleccion.model';
import { Rol } from '@app/middleware/authorization';
import prisma from '@app/lib/prisma';

export class ColeccionController {
    static async getAll(req: Request, res: Response) {
        try {
            const colecciones = await ColeccionModel.findByUserId(req.user!.id_usuario);
            return res.json(colecciones);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener las colecciones' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID no proporcionado' });
            }
            const id = parseInt(req.params.id);
            const coleccion = await ColeccionModel.findById(id);

            if (!coleccion || !coleccion.is_active) {
                return res.status(404).json({ error: 'Coleccion no encontrada' });
            }

            if (coleccion.id_usuario !== req.user!.id_usuario) {
                return res.status(403).json({ error: 'No tiene permiso para ver esta coleccion' });
            }

            res.json(coleccion);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener la coleccion' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { titulo, descripcion } = parse(createColeccionSchema, req.body);

            const coleccion = await ColeccionModel.create({
                titulo: titulo.trim(),
                descripcion: descripcion || '',
                fecha_creacion: new Date(),
                id_usuario: req.user!.id_usuario,
            });

            res.status(201).json(coleccion);
        } catch (error) {
            if (error instanceof ValiError) {
                return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
            }
            return res.status(500).json({ error: 'Error al crear la coleccion' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID no proporcionado' });
            }

            const id = parseInt(req.params.id);
            const coleccion = await ColeccionModel.findById(id);

            if (!coleccion || !coleccion.is_active) {
                return res.status(404).json({ error: 'Coleccion no encontrada' });
            }

            if (coleccion.id_usuario !== req.user!.id_usuario) {
                return res.status(403).json({ error: 'No tiene permiso para modificar esta coleccion' });
            }

            const data = parse(updateColeccionSchema, req.body);
            const coleccionActualizada = await ColeccionModel.update(id, data);
            res.json(coleccionActualizada);
        } catch (error) {
            if (error instanceof ValiError) {
                return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
            }
            return res.status(500).json({ error: 'Error al actualizar la coleccion' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID no proporcionado' });
            }

            const id = parseInt(req.params.id);
            const coleccion = await ColeccionModel.findById(id);

            if (!coleccion || !coleccion.is_active) {
                return res.status(404).json({ error: 'Coleccion no encontrada' });
            }

            if (req.user?.id_rol !== Rol.ADMIN && coleccion.id_usuario !== req.user!.id_usuario) { // solo el admin o el creador de la coleccion pueden eliminarlo
                return res.status(403).json({ error: 'No tiene permiso para eliminar esta coleccion' });
            }

            await ColeccionModel.delete(id);
            res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar la coleccion' });
        }
    }

    static async addTestimonio(req: Request, res: Response) {
        try {
            const { id_coleccion, id_testimonio } = req.body;

            const coleccion = await ColeccionModel.findById(id_coleccion);
            if (!coleccion) {
                return res.status(404).json({ error: 'Colección no encontrada' });
            }

            if (req.user?.id_rol !== Rol.ADMIN && coleccion.id_usuario !== req.user!.id_usuario) {
                return res.status(403).json({ error: 'No tiene permiso para modificar esta colección' });
            }

            const existingEntry = await prisma.colecciones_testimonios.findUnique({
                where: {
                    id_coleccion_id_testimonio: { id_coleccion, id_testimonio },
                },
            });

            if (existingEntry) {
                await prisma.colecciones_testimonios.delete({
                    where: {
                        id_coleccion_id_testimonio: { id_coleccion, id_testimonio },
                    },
                });
                return res.json({ action: 'removed' });
            }

            await prisma.colecciones_testimonios.create({
                data: { id_coleccion, id_testimonio, fecha_agregado: new Date() }
            });

            res.status(201).json({ action: 'added' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al agregar el testimonio a la colección' });
        }
    }

    static async removeTestimonio(req: Request, res: Response) {
        try {
            const { id_coleccion, id_testimonio } = req.params;

            if (!id_coleccion || !id_testimonio) {
                return res.status(400).json({ error: 'IDs no proporcionados' });
            }

            const coleccion = await ColeccionModel.findById(parseInt(id_coleccion));
            if (!coleccion) {
                return res.status(404).json({ error: 'Colección no encontrada' });
            }

            if (req.user?.id_rol !== Rol.ADMIN && coleccion.id_usuario !== req.user!.id_usuario) {
                return res.status(403).json({ error: 'No tiene permiso para modificar esta colección' });
            }

            // Eliminar el testimonio de la colección
            await prisma.colecciones_testimonios.delete({
                where: {
                    id_coleccion_id_testimonio: {
                        id_coleccion: parseInt(id_coleccion),
                        id_testimonio: parseInt(id_testimonio)
                    }
                }
            });

            res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar el testimonio de la colección' });
        }
    }

    static async getTestimonios(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const skip = parseInt(req.query.skip as string) || 0;
            const take = parseInt(req.query.take as string) || 50;

            if (!id) {
                return res.status(400).json({ error: 'ID no proporcionado' });
            }

            const coleccion = await ColeccionModel.findById(parseInt(id));
            if (!coleccion) {
                return res.status(404).json({ error: 'Colección no encontrada' });
            }

            if (req.user?.id_rol !== Rol.ADMIN && coleccion.id_usuario !== req.user!.id_usuario) {
                return res.status(403).json({ error: 'No tiene permiso para ver esta colección' });
            }

            const total = await prisma.colecciones_testimonios.count({
                where: { id_coleccion: parseInt(id), testimonios: { is_active: true } },
            });

            const testimonios = await prisma.colecciones_testimonios.findMany({
                where: {
                    id_coleccion: parseInt(id),
                    testimonios: { is_active: true },
                },
                skip,
                take,
                include: {
                    testimonios: {
                        include: {
                            estado: {
                                select: { nombre: true }
                            },
                            medio: {
                                select: { nombre: true }
                            },
                            usuarios_testimonios_subido_porTousuarios: {
                                select: { nombre: true }
                            },
                            testimonios_categorias: {
                                include: {
                                    categorias: {
                                        select: { nombre: true }
                                    }
                                }
                            },
                            testimonios_etiquetas: {
                                include: {
                                    etiquetas: {
                                        select: { nombre: true }
                                    }
                                }
                            },
                            testimonios_eventos: {
                                include: {
                                    eventos_historicos: {
                                        select: { nombre: true }
                                    }
                                }
                            },
                        }
                    }
                }
            });

            res.json({
                data: testimonios.map((t) => ({
                    id: t.testimonios.id_testimonio,
                    title: t.testimonios.titulo,
                    description: t.testimonios.descripcion,
                    content: t.testimonios.contenido_texto,
                    url: t.testimonios.url_medio,
                    duration: t.testimonios.duracion,
                    latitude: t.testimonios.latitud ? Number(t.testimonios.latitud) : null,
                    longitude: t.testimonios.longitud ? Number(t.testimonios.longitud) : null,
                    createdAt: t.testimonios.created_at,
                    status: t.testimonios.estado.nombre,
                    format: t.testimonios.medio.nombre,
                    author: t.testimonios.usuarios_testimonios_subido_porTousuarios.nombre,
                    categories: t.testimonios.testimonios_categorias.map((tc) => tc.categorias.nombre),
                    tags: t.testimonios.testimonios_etiquetas.map((te) => te.etiquetas.nombre),
                    event: t.testimonios.testimonios_eventos[0]?.eventos_historicos?.nombre,
                })),
                total,
                skip,
                take,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener los testimonios de la colección' });
        }
    }

    static async getFavoritesCollectionId(req: Request, res: Response) {
        try {
            const userId = req.user!.id_usuario;
            const favoritosColeccion = await prisma.colecciones.findFirst({
                where: { id_usuario: userId, titulo: 'Favoritos' },
                select: { id_coleccion: true },
            });
            if (!favoritosColeccion) {
                return res.status(404).json({ error: 'Colección Favoritos no encontrada' });
            }
            res.json({ id_coleccion: favoritosColeccion.id_coleccion });
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener ID de colección Favoritos' });
        }
    }

    static async getFavoriteTestimonyIds(req: Request, res: Response) {
        try {
            const userId = req.user!.id_usuario;

            // Buscar la colección "Favoritos" del usuario
            const favoritosColeccion = await prisma.colecciones.findFirst({
                where: {
                    id_usuario: userId,
                    titulo: 'Favoritos',
                },
                select: { id_coleccion: true },
            });

            if (!favoritosColeccion) {
                return res.status(404).json({ error: 'Colección Favoritos no encontrada' });
            }

            // Obtener los IDs de los testimonios en la colección "Favoritos"
            const favoritos = await prisma.colecciones_testimonios.findMany({
                where: {
                    id_coleccion: favoritosColeccion.id_coleccion,
                },
                select: { id_testimonio: true },
            });

            const favoriteIds = favoritos.map((fav) => fav.id_testimonio);

            res.json(favoriteIds);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener los IDs de testimonios favoritos' });
        }
    }

    static async getFavoriteCount(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID de testimonio no proporcionado' });
            }

            const testimonyId = parseInt(id);
            const count = await prisma.colecciones_testimonios.count({
                where: {
                    id_testimonio: testimonyId,
                    colecciones: {
                        titulo: 'Favoritos',
                    },
                },
            });

            res.json({ count });
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener el conteo de favoritos' });
        }
    }

    static async toggleFavorite(req: Request, res: Response) {
        try {
            const { testimonioId } = req.params;
            const userId = req.user!.id_usuario;

            if (!testimonioId) {
                return res.status(400).json({ error: 'ID de testimonio no proporcionado' });
            }

            const id = parseInt(testimonioId);

            let favoritosColeccion = await prisma.colecciones.findFirst({
                where: { id_usuario: userId, titulo: 'Favoritos' },
            });

            if (!favoritosColeccion) {
                favoritosColeccion = await prisma.colecciones.create({
                    data: {
                        titulo: 'Favoritos',
                        descripcion: 'Colección de favoritos',
                        fecha_creacion: new Date(),
                        id_usuario: userId,
                    },
                });
            }

            const existingEntry = await prisma.colecciones_testimonios.findUnique({
                where: {
                    id_coleccion_id_testimonio: {
                        id_coleccion: favoritosColeccion.id_coleccion,
                        id_testimonio: id,
                    },
                },
            });

            let action: 'added' | 'removed';

            if (existingEntry) {
                await prisma.colecciones_testimonios.delete({
                    where: {
                        id_coleccion_id_testimonio: {
                            id_coleccion: favoritosColeccion.id_coleccion,
                            id_testimonio: id,
                        },
                    },
                });
                action = 'removed';
            } else {
                await prisma.colecciones_testimonios.create({
                    data: {
                        id_coleccion: favoritosColeccion.id_coleccion,
                        id_testimonio: id,
                        fecha_agregado: new Date(),
                    },
                });
                action = 'added';
            }

            const favoriteIds = (await prisma.colecciones_testimonios.findMany({
                where: { id_coleccion: favoritosColeccion.id_coleccion },
                select: { id_testimonio: true },
            })).map(fav => fav.id_testimonio);

            const count = await prisma.colecciones_testimonios.count({
                where: {
                    id_testimonio: id,
                    colecciones: { titulo: 'Favoritos' },
                },
            });

            res.json({ action, favoriteIds, favoriteCount: count });
        } catch (error) {
            return res.status(500).json({ error: 'Error al togglear favorito' });
        }
    }
}