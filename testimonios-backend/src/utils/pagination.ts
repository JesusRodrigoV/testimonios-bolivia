export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export function getPaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}
