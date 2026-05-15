import { maxLength, minLength, number, object, optional, pipe, string } from "valibot";

export const createForoTemaSchema = object({
  titulo: pipe(string(), minLength(1, "El título es requerido"), maxLength(100, "El título no debe exceder 100 caracteres")),
  descripcion: pipe(string(), minLength(1, "La descripción es requerida"), maxLength(2000, "La descripción no debe exceder 2000 caracteres")),
  id_evento: optional(number()),
  id_testimonio: optional(number()),
});

export const createForoComentarioSchema = object({
  contenido: pipe(string(), minLength(1, "El comentario no puede estar vacío"), maxLength(500, "El comentario no debe exceder 500 caracteres")),
  id_forotema: number(),
  parent_id: optional(number()),
});
