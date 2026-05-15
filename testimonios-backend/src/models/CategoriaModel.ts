import { maxLength, minLength, object, optional, pipe, string } from "valibot";
import prisma from "@app/lib/prisma";

const categoriaNombreSchema = pipe(string(), minLength(1, "El nombre es requerido"), maxLength(100, "El nombre no debe exceder 100 caracteres"));
const categoriaDescripcionSchema = optional(pipe(string(), maxLength(500, "La descripción no debe exceder 500 caracteres")));

export const createCategoriaSchema = object({
  nombre: categoriaNombreSchema,
  descripcion: categoriaDescripcionSchema,
});

export const updateCategoriaSchema = object({
  nombre: optional(categoriaNombreSchema),
  descripcion: categoriaDescripcionSchema,
});

export class CategoriaModel {
  static async findAll() {
    return prisma.categorias.findMany({
      where: { is_active: true }
    });
  }

  static async findById(id: number) {
    return prisma.categorias.findUnique({
      where: { id_categoria: id }
    });
  }

  static async create(data: { nombre: string; descripcion: string }) {
    return prisma.categorias.create({
      data
    });
  }

  static async update(id: number, data: { nombre?: string; descripcion?: string }) {
    return prisma.categorias.update({
      where: { id_categoria: id },
      data
    });
  }

  static async delete(id: number) {
    return prisma.categorias.update({
      where: { id_categoria: id },
      data: { is_active: false }
    });
  }
}