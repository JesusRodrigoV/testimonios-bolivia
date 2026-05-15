interface User {
  id_usuario: number;
  nombre: string;
  profile_image?: string;
  rol: { id_rol: number; nombre: string };
}

interface Testimony {
  titulo: string;
}

export interface Comment {
  id_comentario: number;
  contenido: string;
  id_estado: number;
  fecha_creacion: string;
  creado_por_id_usuario: number;
  id_testimonio: number;
  parent_id?: number;
  usuarios: User;
  testimonios?: Testimony;
  replies: Comment[]; 
  likes: { id_usuario: number }[];
  likeCount?: number; 
  isLiked?: boolean; 
}