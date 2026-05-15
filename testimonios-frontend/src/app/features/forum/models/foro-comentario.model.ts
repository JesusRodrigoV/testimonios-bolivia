interface Rol {
  nombre: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  profile_image?: string;
  rol: Rol;
}

export interface ForoComentario {
  id_forocoment: number;
  contenido: string;
  fecha_creacion: string;
  creado_por_id_usuario: number;
  id_forotema: number;
  parent_id?: number;
  usuarios: Usuario;
  children: ForoComentario[];
}