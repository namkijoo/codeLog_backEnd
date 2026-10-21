import { Router } from 'express';

import Paths from '#src/common/constants/Paths/index.ts';

import authRouter from './auth.router.ts';
import userRouter from './user.router.ts';

const apiRouter = Router();

apiRouter.use(Paths.Users.PATH, userRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
