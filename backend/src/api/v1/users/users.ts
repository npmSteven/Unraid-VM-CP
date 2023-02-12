import express, { Request, Response } from 'express';

// Responses
import { respondInternalServerError } from '../../../services/responses.js';

// Validation
import { validateReq } from '../../../middleware/validateReq.js';
import { checkPassword, checkUsername } from '../../../validation/user.js';


const router = express.Router();

type IUserCreateBody = {
  username: string
  password: string
}

/**
 * Create MW to for jwt, so that we can tell if the user is a unraid user
 */

router.post('/users',
  [
    checkUsername,
    checkPassword,
    validateReq,
  ], async (req: Request<{}, {}, IUserCreateBody>, res: Response) => {
    try {

    } catch (error) {
      console.error('ERROR - /users', error);
      return res.status(500).json(respondInternalServerError());
    }
  })

export default router;
