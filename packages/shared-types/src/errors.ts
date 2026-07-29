import { ok, err, type Result } from 'neverthrow'

export class BadRequestError extends Error {
  statusCode = 400
  constructor(message: string) { super(message); this.name = 'BadRequestError' }
}
export class ForbiddenError extends Error {
  statusCode = 403
  constructor(message: string) { super(message); this.name = 'ForbiddenError' }
}
export class UnauthorizedError extends Error {
  statusCode = 401
  constructor(message: string) { super(message); this.name = 'UnauthorizedError' }
}
export class NotFoundError extends Error {
  statusCode = 404
  constructor(message: string) { super(message); this.name = 'NotFoundError' }
}
export class ConflictRequestError extends Error {
  statusCode = 409
  constructor(message: string) { super(message); this.name = 'ConflictRequestError' }
}

export type AppErrorType =
  | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT'
  | 'BAD_REQUEST' | 'UNRAID_ERROR' | 'DB_ERROR' | 'INTERNAL'

export type AppError = {
  type: AppErrorType
  message: string
}

export const AppErr = {
  unauthorized: (msg?: string): AppError => ({ type: 'UNAUTHORIZED', message: msg ?? 'Unauthorized' }),
  forbidden: (msg?: string): AppError => ({ type: 'FORBIDDEN', message: msg ?? 'Forbidden' }),
  notFound: (msg?: string): AppError => ({ type: 'NOT_FOUND', message: msg ?? 'Not found' }),
  conflict: (msg?: string): AppError => ({ type: 'CONFLICT', message: msg ?? 'Conflict' }),
  badRequest: (msg?: string): AppError => ({ type: 'BAD_REQUEST', message: msg ?? 'Bad request' }),
  unraid: (msg?: string): AppError => ({ type: 'UNRAID_ERROR', message: msg ?? 'Unraid error' }),
  db: (msg?: string): AppError => ({ type: 'DB_ERROR', message: msg ?? 'Database error' }),
  internal: (msg?: string): AppError => ({ type: 'INTERNAL', message: msg ?? 'Internal server error' }),
}

export const errFromAppErr = (e: AppError): Result<never, AppError> => err(e)
export const okVoid = <T = void>(): Result<T, AppError> => ok(undefined as unknown as T)

export const appErrorToStatusCode = (err: AppError): number => {
  switch (err.type) {
    case 'UNAUTHORIZED': return 401
    case 'FORBIDDEN': return 403
    case 'NOT_FOUND': return 404
    case 'CONFLICT': return 409
    case 'BAD_REQUEST': return 400
    case 'UNRAID_ERROR': return 502
    case 'DB_ERROR': return 500
    case 'INTERNAL': return 500
  }
}
