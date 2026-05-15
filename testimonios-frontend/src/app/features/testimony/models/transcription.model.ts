export interface Transcripcion {
  id_transcripcion: number;
  contenido: string;
  idioma: string;
  fecha_creacion: string;
  id_testimonio: number;
  creado_por_id_usuario: number;
  testimonios?: { id_testimonio: number; titulo: string };
  usuarios?: { id_usuario: number; nombre: string };
}

export interface TranscripcionResponse {
  success: boolean;
  data: Transcripcion | Transcripcion[];
  metadata?: {
    duracion: number;
    canales: number;
    formato: string;
  };
}