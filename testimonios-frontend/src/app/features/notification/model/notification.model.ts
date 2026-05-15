interface Testimonio {
  titulo: string;
}

interface Estado {
  nombre: string;
}

interface ForoTema {
  titulo: string;
}

export interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  id_testimonio: number | null;
  id_usuario: number;
  id_estado: number | null;
  id_forotema: number | null;
  id_forocoment: number | null;
  id_remitente: number | null;
  fecha_creacion: string;
  leido: boolean;
  testimonios: Testimonio | null;
  estado: Estado | null;
  forotema: ForoTema | null;
}