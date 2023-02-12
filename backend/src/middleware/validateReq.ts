import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { respondErrorValidation, respondInternalServerError } from "../services/responses.js";

export const validateReq = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    if (error?.errors) {
      return res.status(400).json(respondErrorValidation(error.errors));
    }
    console.error('ERROR - validateReq():', error);
    return res.status(500).json(respondInternalServerError());
  }
};
