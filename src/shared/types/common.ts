/** Generic Result type for operations that may fail */
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/** Makes a type nullable */
export type Nullable<T> = T | null;

/** Makes specified keys required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
