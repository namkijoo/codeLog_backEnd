import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import NoteRepo, { type NoteRow } from '#src/repos/NoteRepo.ts';
import FolderService from '#src/services/FolderService.ts';

export type CreateNoteParams = {
  title: string;
  content: string;
};

export type NoteListItem = {
  id: number;
  folderId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteResponse = {
  id: number;
  folderId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

function toListItem(row: NoteRow): NoteListItem {
  return {
    id: row.id,
    folderId: row.folderId,
    title: row.title,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function toResponse(row: NoteRow): NoteResponse {
  return {
    id: row.id,
    folderId: row.folderId,
    title: row.title,
    content: row.content,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function assertNoteRequest(params: CreateNoteParams): {
  title: string;
  content: string;
} {
  if (typeof params.title !== 'string' || !params.title.trim()) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '노트 제목이 필요합니다.');
  }
  if (typeof params.content !== 'string') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '노트 본문이 필요합니다.');
  }

  const title = params.title.trim();
  if (title.length > 200) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '노트 제목은 200자 이하여야 합니다.',
    );
  }

  return { title, content: params.content };
}

async function getNotesByFolderId(
  folderId: number,
  userId: number,
): Promise<NoteListItem[]> {
  await FolderService.assertOwnedFolder(folderId, userId);
  const rows = await NoteRepo.findAllByFolderId(folderId, userId);
  return rows.map(toListItem);
}

async function createNote(
  folderId: number,
  params: CreateNoteParams,
  userId: number,
): Promise<NoteResponse> {
  await FolderService.assertOwnedFolder(folderId, userId);
  const { title, content } = assertNoteRequest(params);

  const id = await NoteRepo.createNote(folderId, userId, title, content);
  const created = await NoteRepo.findByIdAndUserId(id, userId);
  if (!created) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '생성 실패');
  }
  return toResponse(created);
}

async function getNoteById(id: number, userId: number): Promise<NoteResponse> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 노트 ID입니다.');
  }

  const note = await NoteRepo.findByIdAndUserId(id, userId);
  if (!note) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }
  return toResponse(note);
}

async function updateNote(
  id: number,
  params: CreateNoteParams,
  userId: number,
): Promise<NoteResponse> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 노트 ID입니다.');
  }

  const mine = await NoteRepo.findByIdAndUserId(id, userId);
  if (!mine) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }

  const { title, content } = assertNoteRequest(params);
  const updatedRows = await NoteRepo.updateNote(id, userId, title, content);
  if (updatedRows !== 1) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }

  const updated = await NoteRepo.findByIdAndUserId(id, userId);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }
  return toResponse(updated);
}

async function deleteNote(id: number, userId: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 노트 ID입니다.');
  }

  const mine = await NoteRepo.findByIdAndUserId(id, userId);
  if (!mine) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }

  const deleted = await NoteRepo.deleteNote(id, userId);
  if (deleted !== 1) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '노트를 찾을 수 없습니다.');
  }
}

export default {
  getNotesByFolderId,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
};
