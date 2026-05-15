import { Testimony } from "@app/features/testimony/models/testimonio.model";

export interface Collection {
  id_coleccion: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  id_usuario: number;
}

export interface CollectionTestimony {
  id_coleccion: number;
  id_testimonio: number;
  fecha_agregado: string;
  testimonios: Testimony;
}