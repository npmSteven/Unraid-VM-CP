import express, { Response } from 'express';

import { config } from '../../../config.js';
import { authCheck } from '../../../middleware/authCheck.js';
import { validateReq } from '../../../middleware/validateReq.js';
import { errorHandler } from '../../../services/ErrorHandler.js';
import { respondSuccess } from '../../../services/responses.js';

const router = express.Router();

router.get('/',
  [
    authCheck,
    validateReq,
  ],
  async (_req: any, res: Response) => {
    try {
      return res.json(respondSuccess({
        unraidBaseUrl: config.unraid.baseUrl,
      }));
    } catch (error) {
      console.error('ERROR - /config', error);
      return errorHandler(res, error);
    }
  }
);

export default router;
