import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

import { respondError, respondErrorValidation, respondInternalServerError, respondSuccess } from '../../../services/responses.js';

const router = express.Router();

router.post('/login', 
  check('username')
    .exists()
    .isLength({ min: 3, max: 16 })
    .isString()
    .withMessage('Username must be a string and between 3 and 16 characters long'),
  check('password')
    .exists()
    .isLength({ min: 3, max: 16 })
    .isString()
    .withMessage('Password must be a string and between 3 and 16 characters long'),
  async (req: Request, res: Response) => {
  try {
    validationResult(req).throw();

    

    return res.json(respondSuccess({
      accessToken: 'test',
    }))
  } catch (error) {
    if (error?.errors) {
      return res.status(400).json(respondErrorValidation(error.errors));
    }
    console.error('ERROR - /login', error);
    return res.status(500).json(respondInternalServerError());
  }
});

export default router;
