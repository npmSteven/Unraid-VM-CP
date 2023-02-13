import express, { Response } from 'express';

// Validation
import { validateReq } from '../../../middleware/validateReq.js';
import { checkPassword, checkUsername } from '../../../validation/user.js';

// Middlware
import { authCheck } from '../../../middleware/authCheck.js';
import { config } from '../../../config.js';

// Types
import { IRequestAuth } from '../../../types/IRequestAuth.js';

// Services
import { createUser, getUserById, getUserByUsername } from '../../../services/user.js';
import { sanitiseUser } from '../../../services/sanitise.js';
import { respondErrorMessage, respondInternalServerError, respondSuccess } from '../../../services/responses.js';

const router = express.Router();

router.get('/',
  [
    authCheck,
  ], async (req: IRequestAuth, res: Response) => {
    try {
      if (req.user.isUnraidUser) {
        return res.json(respondSuccess({ id: req.user.id, isUnraidUser: req.user.isUnraidUser }));
      }

      const user = await getUserById(req.user.id);
      if (!user) return res.status(404).json(respondErrorMessage('Unable to find user'));

      return res.json(respondSuccess(sanitiseUser(user.dataValues)));
    } catch (error) {
      console.error('ERROR - /users', error);
      return res.status(500).json(respondInternalServerError());
    }
  }
)

type IUserCreateBody = {
  username: string
  password: string
}

/**
 * Create a user
 */
router.post('/',
  [
    authCheck,
    checkUsername,
    checkPassword,
    validateReq,
  ], async (req: IRequestAuth<IUserCreateBody>, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        return res.status(403).json(respondErrorMessage('You must be logged in as an unraid user, to call this endpoint'));
      }

      const { username, password } = req.body;
      const { unraid } = config;

      // Check if username is unraid username
      if (username === unraid.username) {
        return res.status(409).json(respondErrorMessage('Cannot use a username that an unraid user has'));
      }

      // Check if username is already taken
      const user = await getUserByUsername(username);
      if (user) return res.status(409).json(respondErrorMessage('A user already exists with this username'));

      const newUser = await createUser(username, password);

      return res.json(respondSuccess(sanitiseUser(newUser.dataValues)))
    } catch (error) {
      console.error('ERROR - /users', error);
      return res.status(500).json(respondInternalServerError());
    }
  }
)

export default router;
