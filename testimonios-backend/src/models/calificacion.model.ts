import { maxValue, minValue, number, object, optional, pipe, string } from "valibot";
import prisma from "@app/lib/prisma";

export const updateCalificacionSchema = object({
  puntuacion: optional(pipe(number(), minValue(1, "La puntuación debe ser al menos 1"), maxValue(5, "La puntuación debe ser máximo 5"))),
  fecha: optional(string()),
  id_testimonio: optional(pipe(number())),
});

export class CalificacionModel {
  static async findAll() {
    return prisma.calificaciones.findMany({
      where: { is_active: true }
    });
  }

  static async findById(id: number) {
    return prisma.calificaciones.findUnique({
      where: { id_calificacion: id }
    });
  }

  static async findExistingCalificacion(id_usuario: number, id_testimonio: number) {
    return prisma.calificaciones.findFirst({
      where: {
        id_usuario,
        id_testimonio,
        is_active: true
      }
    });
  }

  static async create(data: { puntuacion: number, fecha: Date, id_usuario: number, id_testimonio: number }) {
    const existingCalificacion = await this.findExistingCalificacion(data.id_usuario, data.id_testimonio);

    if (existingCalificacion) {
      throw new Error('El usuario ya ha calificado este testimonio');
    }

    return prisma.calificaciones.create({
      data
    });
  }

  static async update(id: number, data: { puntuacion?: number, fecha?: Date, id_usuario?: number, id_testimonio?: number }) {
    return prisma.calificaciones.update({
      where: { id_calificacion: id },
      data
    });
  }

  static async delete(id: number) {
    return prisma.calificaciones.update({
      where: { id_calificacion: id },
      data: { is_active: false }
    });
  }

  static async getTopRatedTestimonies(limit: number) {
    const includeClause = {
      medio: true,
      estado: true,
      usuarios_testimonios_subido_porTousuarios: true,
      usuarios_testimonios_verificado_porTousuarios: true,
      testimonios_categorias: { include: { categorias: true } },
      testimonios_etiquetas: { include: { etiquetas: true } },
      testimonios_eventos: { include: { eventos_historicos: true } },
    } as const;

    const mapTestimony = (testimony: any, rating?: { _avg: { puntuacion: number | null }; _count: { id_calificacion: number } }) => ({
      id: testimony.id_testimonio,
      title: testimony.titulo,
      description: testimony.descripcion,
      content: testimony.contenido_texto,
      url: testimony.url_medio,
      duration: testimony.duracion,
      latitude: testimony.latitud ? Number(testimony.latitud) : null,
      longitude: testimony.longitud ? Number(testimony.longitud) : null,
      createdAt: testimony.created_at,
      updatedAt: testimony.updated_at,
      status: testimony.estado.nombre,
      format: testimony.medio.nombre,
      author: testimony.usuarios_testimonios_subido_porTousuarios.nombre,
      categories: testimony.testimonios_categorias.map((tc: any) => tc.categorias.nombre),
      tags: testimony.testimonios_etiquetas.map((te: any) => te.etiquetas.nombre),
      event: testimony.testimonios_eventos[0]?.eventos_historicos?.nombre || null,
      rating: {
        average: rating?._avg.puntuacion ?? 0,
        total: rating?._count.id_calificacion ?? 0,
      },
    });

    const globalStats = await prisma.calificaciones.aggregate({
      where: { is_active: true },
      _avg: { puntuacion: true },
      _count: true,
    });
    const globalAvg = globalStats._avg.puntuacion || 3;
    const priorStrength = 2;

    const ratings = await prisma.calificaciones.groupBy({
      by: ["id_testimonio"],
      where: { is_active: true },
      _avg: { puntuacion: true },
      _count: { id_calificacion: true },
    });

    if (ratings.length === 0) {
      let recent = await prisma.testimonios.findMany({
        where: { estado: { nombre: "Aprobado" }, is_active: true },
        orderBy: { created_at: "desc" },
        take: limit,
        include: includeClause,
      });
      if (recent.length === 0) {
        recent = await prisma.testimonios.findMany({
          where: { is_active: true },
          orderBy: { created_at: "desc" },
          take: limit,
          include: includeClause,
        });
      }
      return recent.map((t) => mapTestimony(t));
    }

    const scored = ratings
      .map((r) => ({
        id_testimonio: r.id_testimonio,
        avg: r._avg.puntuacion || 0,
        count: r._count.id_calificacion,
        bayesianScore:
          ((r._avg.puntuacion || 0) * r._count.id_calificacion +
            globalAvg * priorStrength) /
          (r._count.id_calificacion + priorStrength),
      }))
      .sort((a, b) => b.bayesianScore - a.bayesianScore);

    const topIds = scored.slice(0, limit).map((r) => r.id_testimonio);

    let testimonies = await prisma.testimonios.findMany({
      where: {
        id_testimonio: { in: topIds },
        estado: { nombre: "Aprobado" },
        is_active: true,
      },
      include: includeClause,
    });

    testimonies.sort(
      (a, b) => topIds.indexOf(a.id_testimonio) - topIds.indexOf(b.id_testimonio)
    );

    const remainingLimit = limit - testimonies.length;
    if (remainingLimit > 0) {
      const alreadyIncludedIds = testimonies.map((t) => t.id_testimonio);
      const additionalTestimonies = await prisma.testimonios.findMany({
        where: {
          id_testimonio: { notIn: alreadyIncludedIds },
          estado: { nombre: "Aprobado" },
          is_active: true,
        },
        include: includeClause,
        orderBy: { created_at: "desc" },
        take: remainingLimit,
      });
      testimonies = [...testimonies, ...additionalTestimonies];
    }

    if (testimonies.length === 0) {
      testimonies = await prisma.testimonios.findMany({
        where: { is_active: true },
        orderBy: { created_at: "desc" },
        take: limit,
        include: includeClause,
      });
    }

    return testimonies.slice(0, limit).map((testimony) => {
      const rating = scored.find((r) => r.id_testimonio === testimony.id_testimonio);
      return mapTestimony(testimony, rating ? { _avg: { puntuacion: rating.avg }, _count: { id_calificacion: rating.count } } : undefined);
    });
  }

  static async getTestimonyRatingStats(id_testimonio: number) {
    const stats = await prisma.calificaciones.aggregate({
      where: {
        id_testimonio,
        is_active: true
      },
      _avg: {
        puntuacion: true
      },
      _count: {
        id_calificacion: true
      }
    });

    return {
      averageRating: stats._avg.puntuacion || 0,
      totalRatings: stats._count.id_calificacion
    };
  }
}