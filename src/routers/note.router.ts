import { type RequestHandler, Router } from 'express';

import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import {
  type AuthedRequest,
  requireAuth,
} from '#src/middlewares/auth.middleware.ts';
import NoteService from '#src/services/NoteService.ts';
import type { CreateNoteParams } from '#src/services/NoteService.ts';

const router = Router();
router.use(requireAuth as RequestHandler);

router.get('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const noteId = Number(req.params.id);
  const note = await NoteService.getNoteById(noteId, userId);
  res.status(HttpStatusCodes.OK).json(note);
});

router.put('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const noteId = Number(req.params.id);
  const updated = await NoteService.updateNote(
    noteId,
    req.body as CreateNoteParams,
    userId,
  );
  res.status(HttpStatusCodes.OK).json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const noteId = Number(req.params.id);
  if (!Number.isFinite(noteId) || noteId <= 0) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '잘못된 노트 ID입니다.',
    );
  }
  await NoteService.deleteNote(noteId, userId);
  res.status(HttpStatusCodes.NO_CONTENT).send();
});

export default router;
