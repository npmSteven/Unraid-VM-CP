import { NextFunction, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../config.js';
import { BadRequestError, errorHandler } from '../services/ErrorHandler.js';
import { respondErrorMessage } from '../services/responses.js';
import { login } from '../services/unraid.js';

export const authCheck = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Check headers for "Authorization"
    const authorization = req.header('Authorization');
    if (!authorization && !req.query?.access_token) {
      throw new BadRequestError('Bearer token not provided in "Authorization" header')
    }

    const [type, token]: string[] = authorization.split(' ');
    if (type !== 'Bearer') {
      throw new BadRequestError('Invalid token type, must be "Bearer"')
    }

    if (!token) {
      throw new BadRequestError('You must provide a token with a type of "Bearer"')
    }

    const decoded: any = jsonwebtoken.verify(token, config.jwt.secret);
    await login();
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('ERROR - authCheck.js - authCheck():', error);
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(401)
        .json(respondErrorMessage('Token has expired or is invalid'));
    }
    return errorHandler(res, error);
  }
};
