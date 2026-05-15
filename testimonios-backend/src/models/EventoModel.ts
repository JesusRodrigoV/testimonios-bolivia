import { maxLength, minLength, object, optional, pipe, string, isoDate } from "valibot";
import prisma from "@app/lib/prisma";

const eventNombreSchema = pipe(string(), minLength(1, "El nombre es requerido"), maxLength(100, "El nombre no debe exceder 100 caracteres"));
const eventDescripcionSchema = pipe(string(), minLength(1, "La descripción es requerida"), maxLength(2000, "La descripción no debe exceder 2000 caracteres"));
const eventFechaSchema = pipe(string(), isoDate("La fecha debe ser una fecha válida (YYYY-MM-DD)"));

export const createEventoSchema = object({
  nombre: eventNombreSchema,
  descripcion: eventDescripcionSchema,
  fecha: eventFechaSchema,
});

export const updateEventoSchema = object({
  nombre: optional(eventNombreSchema),
  descripcion: optional(eventDescripcionSchema),
  fecha: optional(eventFechaSchema),
});

export class EventoModel {
  static async findAll() {
    return prisma.eventos_historicos.findMany({
      where: { is_active: true },
      orderBy: { fecha: "desc" },
    });
  }

  static async findAllAdmin() {
    return prisma.eventos_historicos.findMany({
      orderBy: { fecha: "desc" },
    });
  }

  static async findById(id: number) {
    return prisma.eventos_historicos.findUnique({
      where: { id_evento: id },
    });
  }

  static async create(data: { nombre: string; descripcion: string; fecha: string }) {
    return prisma.eventos_historicos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: new Date(data.fecha),
      },
    });
  }

  static async update(id: number, data: { nombre?: string; descripcion?: string; fecha?: string }) {
    return prisma.eventos_historicos.update({
      where: { id_evento: id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.fecha !== undefined && { fecha: new Date(data.fecha) }),
      },
    });
  }

  static async delete(id: number) {
    return prisma.eventos_historicos.update({
      where: { id_evento: id },
      data: { is_active: false },
    });
  }
}
