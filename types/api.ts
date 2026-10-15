/** Respons tunggal Laravel API Resource. */
export interface ApiResource<T> {
  data: T;
}

/** Respons paginasi Laravel (ResourceCollection + paginate()). */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

/** Error validasi Laravel (422). */
export interface ValidationErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}
