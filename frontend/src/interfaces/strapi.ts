export interface StrapiMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T | T[];
  meta: StrapiMeta;
}
