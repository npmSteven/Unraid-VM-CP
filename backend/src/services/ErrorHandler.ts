import { Response } from "express";
import { respondErrorMessage, respondInternalServerError } from "./responses.js";

export class UnauthorizedError extends Error {
  statusCode: number;
  constructor (message: string) {
      super(message);
      this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor (message: string) {
      super(message);
      this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  constructor (message: string) {
      super(message);
      this.statusCode = 404;
  }
}

export class BadRequestError extends Error {
  statusCode: number;
  constructor (message: string) {
      super(message);
      this.statusCode = 400;
  }
}

export class ConflictRequestError extends Error {
  statusCode: number;
  constructor (message: string) {
      super(message);
      this.statusCode = 409;
  }
}

export const errorHandler = (res: Response, error: Error) => {
  console.error('ERROR', error);
  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof BadRequestError ||
    error instanceof ConflictRequestError
  ) {
    return res.status(error.statusCode).json(respondErrorMessage(error.message));
  }
  return res.status(500).json(respondInternalServerError());
}
