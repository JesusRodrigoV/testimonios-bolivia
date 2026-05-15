import {
  date,
  email,
  maxLength,
  minLength,
  nullable,
  number,
  object,
  optional,
  pipe,
  string,
  type InferInput,
} from "valibot";

export const createComentarioSchema = object({
  contenido: pipe(string(), minLength(1, "El contenido es requerido"), maxLength(1000, "El contenido no debe exceder 1000 caracteres")),
  id_testimonio: number(),
  parent_id: optional(number()),
});

export const updateComentarioSchema = object({
  contenido: optional(pipe(string(), minLength(1, "El contenido es requerido"), maxLength(1000, "El contenido no debe exceder 1000 caracteres"))),
  id_estado: optional(pipe(number())),
});

// Tipos usados por commentTree.ts (forum comments)
export type Comment = {
  id_forocoment: number;
  contenido: string;
  fecha_creacion: Date | string;
  creado_por_id_usuario: number;
  id_forotema: number;
  parent_id: number | null;
  usuarios: { id_usuario: number; nombre: string; email: string; profile_image: string | null };
};

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
}

