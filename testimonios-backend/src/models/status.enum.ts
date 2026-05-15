export const StatusEnum = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  ARCHIVADO: "archivado",
  BORRADOR: "borrador",
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
