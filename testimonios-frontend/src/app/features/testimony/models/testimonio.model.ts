import { MediaFormat } from "./media-format";

interface Rating{
  average: number;
  total: number;
}

export interface UserRating {
  id_calificacion: number;
  puntuacion: number;
}

export interface Testimony {
  id: number;
  title: string;
  description: string;
  content: string;
  url: string;
  duration: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt?: string;
  status: string;
  format: MediaFormat;
  author: string;
  categories: string[];
  tags: string[];
  event?: string;
  transcription?: string;
  favoriteCount?: number;
  userRating?: UserRating | null;
  rating?: Rating;
}

export interface TestimonyInput {
  title: string;
  description: string;
  content?: string;
  tags?: string[];
  categories?: string[];
  url: string;
  duration?: number;
  format?: MediaFormat;
  eventId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TestimonyVersion {
  version: number;
  changes: { tipo: string; detalles: string };
  editedAt: string;
  editor: string;
}

export interface MapPoint {
  id: number;
  title: string;
  coordinates: [number, number];
} 
