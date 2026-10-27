import { type RequestHandler, Router } from 'express';

import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import {
  type AuthedRequest,
  requireAuth,
} from '#src/middlewares/auth.middleware.ts';
import RecommendService from '#src/services/RecommendService.ts';

const router = Router();
router.use(requireAuth as RequestHandler);

router.get('/daily', async (req, res) => {
  const { id } = (req as AuthedRequest).user;
  const result = await RecommendService.getDailyRecommend(id);
  res.status(HttpStatusCodes.OK).json(result);
});

export default router;
