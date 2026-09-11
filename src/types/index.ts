export type AppThemeMode = 'light' | 'dark';

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };
