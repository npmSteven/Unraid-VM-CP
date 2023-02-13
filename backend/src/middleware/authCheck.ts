import { NextFunction, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../config.js';
import { respondErrorMessage, respondInternalServerError } from '../services/responses.js';

export const authCheck = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Check headers for "Authorization"
    const authorization = req.header('Authorization');
    if (!authorization && !req.query?.access_token)
      return res
        .status(400)
        .json(
          respondErrorMessage(
            'Bearer token not provided in "Authorization" header'
          )
        );

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer')
      return res
        .status(400)
        .json(respondErrorMessage('Invalid token type, must be "Bearer"'));

    if (!token)
      return res
        .status(400)
        .json(
          respondErrorMessage(
            'You must provide a token with a type of "Bearer"'
          )
        );

    const decoded = jsonwebtoken.verify(token, config.jwt.secret);

    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(401)
        .json(respondErrorMessage('Token has expired or is invalid'));
    }
    console.error('ERROR - authCheck.js - authCheck():', error);
    return res.status(500).json(respondInternalServerError());
  }
};
