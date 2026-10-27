import { Router } from 'express';

import Paths from '#src/common/constants/Paths/index.ts';

import authRouter from './auth.router.ts';
import boardRouter from './board.router.ts';
import recommendRouter from './recommend.router.ts';
import userRouter from './user.router.ts';

const apiRouter = Router();

apiRouter.use(Paths.Users.PATH, userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/boards', boardRouter);
apiRouter.use('/recommend', recommendRouter);

export default apiRouter;
