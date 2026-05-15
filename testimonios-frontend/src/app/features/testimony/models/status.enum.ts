export const StatusEnum = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
