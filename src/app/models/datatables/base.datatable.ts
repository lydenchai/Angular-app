export interface BaseDatatable<T = any[]> {
  list: T[];
  total: number;
}

export interface BaseDatatableResponse<T = any[]> {
  code: number;
  message: string;
  data: BaseDatatable<T>;
}
