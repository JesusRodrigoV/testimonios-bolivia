import { maxLength, minLength, object, optional, pipe, string } from "valibot";
import prisma from "@app/lib/prisma";

const coleccionTituloSchema = pipe(string(), minLength(1, "El título es requerido"), maxLength(200, "El título no debe exceder 200 caracteres"));
const coleccionDescripcionSchema = optional(pipe(string(), maxLength(1000, "La descripción no debe exceder 1000 caracteres")));

export const createColeccionSchema = object({
  titulo: coleccionTituloSchema,
  descripcion: coleccionDescripcionSchema,
});

export const updateColeccionSchema = object({
  titulo: optional(coleccionTituloSchema),
  descripcion: coleccionDescripcionSchema,
});

export class ColeccionModel {
    static async findAll() {
        return prisma.colecciones.findMany({
            where: { is_active: true }
        });
    }

    static async findByUserId(userId: number) {
        return prisma.colecciones.findMany({
            where: { id_usuario: userId, is_active: true }
        });
    }

    static async findById(id: number) {
        return prisma.colecciones.findUnique({
            where: { id_coleccion: id }
        });
    }

    static async create(data: { titulo: string; descripcion: string; fecha_creacion: Date; id_usuario: number }) {
        return prisma.colecciones.create({
            data
        });
    }

    static async update(id: number, data: { titulo?: string; descripcion?: string }) {
        return prisma.colecciones.update({
            where: { id_coleccion: id },
            data
        });
    }

    static async delete(id: number) {
        return prisma.colecciones.update({
            where: { id_coleccion: id },
            data: { is_active: false }
        });
    }
}