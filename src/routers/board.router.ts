import { type RequestHandler, Router } from 'express';

import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import {
  type AuthedRequest,
  requireAuth,
} from '#src/middlewares/auth.middleware.ts';
import BoardService from '#src/services/BoardService.ts';
import type { CreateBoardParams } from '#src/services/BoardService.ts';

const router = Router();
router.use(requireAuth as RequestHandler);

router.get('/', async (req, res) => {
  const { id } = (req as AuthedRequest).user;
  const boards = await BoardService.getAllBoardsByUserId(id);
  res.status(HttpStatusCodes.OK).json(boards);
});

router.post('/', async (req, res) => {
  const { id, username } = (req as AuthedRequest).user;
  const created = await BoardService.createBoard(
    req.body as CreateBoardParams,
    id,
    username,
  );
  res.status(HttpStatusCodes.CREATED).json(created);
});

router.put('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const boardId = Number(req.params.id);
  const updated = await BoardService.updateBoard(
    req.body as CreateBoardParams,
    userId,
    boardId,
  );
  res.status(HttpStatusCodes.OK).json(updated);
});

export default router;
