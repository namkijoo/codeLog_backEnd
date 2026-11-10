import { type RequestHandler, Router } from 'express';

import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import {
  type AuthedRequest,
  requireAuth,
} from '#src/middlewares/auth.middleware.ts';
import FolderService from '#src/services/FolderService.ts';
import type {
  CreateFolderParams,
  UpdateFolderParams,
} from '#src/services/FolderService.ts';
import NoteService from '#src/services/NoteService.ts';
import type { CreateNoteParams } from '#src/services/NoteService.ts';

const router = Router();
router.use(requireAuth as RequestHandler);

router.get('/', async (req, res) => {
  const { id } = (req as AuthedRequest).user;
  const folders = await FolderService.getAllFoldersByUserId(id);
  res.status(HttpStatusCodes.OK).json(folders);
});

router.post('/', async (req, res) => {
  const { id } = (req as AuthedRequest).user;
  const created = await FolderService.createFolder(
    req.body as CreateFolderParams,
    id,
  );
  res.status(HttpStatusCodes.CREATED).json(created);
});

router.put('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const folderId = Number(req.params.id);
  const updated = await FolderService.updateFolder(
    folderId,
    req.body as UpdateFolderParams,
    userId,
  );
  res.status(HttpStatusCodes.OK).json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ id: string }>).user;
  const folderId = Number(req.params.id);
  if (!Number.isFinite(folderId) || folderId <= 0) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '잘못된 폴더 ID입니다.',
    );
  }
  await FolderService.deleteFolder(folderId, userId);
  res.status(HttpStatusCodes.NO_CONTENT).send();
});

router.get('/:folderId/notes', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ folderId: string }>).user;
  const folderId = Number(req.params.folderId);
  const notes = await NoteService.getNotesByFolderId(folderId, userId);
  res.status(HttpStatusCodes.OK).json(notes);
});

router.post('/:folderId/notes', async (req, res) => {
  const { id: userId } = (req as AuthedRequest<{ folderId: string }>).user;
  const folderId = Number(req.params.folderId);
  const created = await NoteService.createNote(
    folderId,
    req.body as CreateNoteParams,
    userId,
  );
  res.status(HttpStatusCodes.CREATED).json(created);
});

export default router;
