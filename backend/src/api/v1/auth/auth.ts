import express, { Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../config.js';

// Responses
import { respondInternalServerError, respondSuccess } from '../../../services/responses.js';

// Validation
import { checkPassword, checkUsername } from '../../../validation/user.js';
import { validateReq } from '../../../middleware/validateReq.js';

const router = express.Router();

type ILoginBody = {
  username: string
  password: string
}

/**
 * Login route needs to handle giving access tokens to both users from db and a root user
 */
router.post('/login',
  [
    checkUsername,
    checkPassword,
    validateReq,
  ],
  async (req: Request<{}, {}, ILoginBody>, res: Response) => {
    try {
      const { username, password } = req.body;

      // Unraid User Root
      const { unraid, jwt } = config;
      if (unraid.username === username && unraid.password === password) {
        const accessToken = jsonwebtoken.sign(unraid.username, jwt.secret, { expiresIn: '30d' });
        return res.json(respondSuccess({
          accessToken,
        }))
      }

      // DB User
      

      return res.json(respondSuccess({
        accessToken: 'test',
      }))
    } catch (error) {
      console.error('ERROR - /login', error);
      return res.status(500).json(respondInternalServerError());
    }
  }
);

export default router;
