import express, { Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

import { config } from '../../../config.js';


// Validation
import { checkPassword, checkUsername } from '../../../validation/validation.js';
import { validateReq } from '../../../middleware/validateReq.js';

// Services
import { getUserByUsername } from '../../../services/user.js';
import { errorHandler, UnauthorizedError } from '../../../services/ErrorHandler.js';
import { respondSuccess } from '../../../services/responses.js';

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

      // Unraid User
      const { unraid, jwt } = config;
      
      if (unraid.username === username && unraid.password === password) {
        const accessToken = jsonwebtoken.sign({ isUnraidUser: true, id: unraid.username }, jwt.secret, { expiresIn: '30d' });
        return res.json(respondSuccess({
          accessToken,
        }))
      }

      // DB User
      const user = await getUserByUsername(username);
      if (!user) throw new UnauthorizedError('Username or password is incorrect');
      const isMatch: boolean = await bcryptjs.compare(password, user.dataValues.password);
      if (!isMatch) throw new UnauthorizedError('Username or password is incorrect');

      const accessToken = jsonwebtoken.sign({ isUnraidUser: false, id: user.dataValues.id }, jwt.secret, { expiresIn: '30d' });

      return res.json(respondSuccess({
        accessToken,
      }))
    } catch (error) {
      console.error('ERROR - /login', error);
      return errorHandler(res, error);
    }
  }
);

export default router;
