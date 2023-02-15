import express, { Response } from 'express';
import { authCheck } from '../../../middleware/authCheck.js';
import { respondErrorMessage, respondInternalServerError, respondSuccess } from '../../../services/responses.js';
import { getVMs } from '../../../services/unraid.js';
import { IRequestAuth } from '../../../types/IRequestAuth.js';

const router = express.Router();

router.get('/', authCheck,
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        return res.status(403).json(respondErrorMessage('You must be logged in as an unraid user, to call this endpoint'));
      }
      const vms = await getVMs()
      return res.json(respondSuccess(vms));
    } catch (error) {
      console.error('ERROR - /vms', error);
      return res.status(500).json(respondInternalServerError());
    }
  }
)

export default router;