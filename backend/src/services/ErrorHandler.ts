import { respondErrorMessage, respondInternalServerError } from "./responses.js";

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
  }
}

export class ConflictRequestError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
  }
}

export const errorHandler = (error: Error) => {
  console.error('ERROR', error);
  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof BadRequestError ||
    error instanceof ConflictRequestError
  ) {
    return Response.json(respondErrorMessage(error.message), { status: error.statusCode });
  }
  return Response.json(respondInternalServerError(), { status: 500 });
}
