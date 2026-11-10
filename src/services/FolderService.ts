import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import FolderRepo, { type FolderRow } from '#src/repos/FolderRepo.ts';

export type CreateFolderParams = {
  title: string;
};

export type UpdateFolderParams = {
  title: string;
  sortOrder?: number;
};

export type FolderResponse = {
  id: number;
  title: string;
  sortOrder: number;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
};

function toResponse(row: FolderRow): FolderResponse {
  return {
    id: row.id,
    title: row.title,
    sortOrder: row.sortOrder,
    noteCount: Number(row.noteCount ?? 0),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function assertTitle(title: unknown): string {
  if (typeof title !== 'string' || !title.trim()) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '폴더 제목이 필요합니다.');
  }
  const trimmed = title.trim();
  if (trimmed.length > 100) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '폴더 제목은 100자 이하여야 합니다.',
    );
  }
  return trimmed;
}

async function getAllFoldersByUserId(userId: number): Promise<FolderResponse[]> {
  const rows = await FolderRepo.findAllByUserId(userId);
  return rows.map(toResponse);
}

async function createFolder(
  params: CreateFolderParams,
  userId: number,
): Promise<FolderResponse> {
  const title = assertTitle(params.title);

  if (await FolderRepo.existsByUserAndTitle(userId, title)) {
    throw new RouteError(HttpStatusCodes.CONFLICT, '이미 존재하는 폴더명입니다.');
  }

  const sortOrder = await FolderRepo.getNextSortOrder(userId);
  const id = await FolderRepo.createFolder(userId, title, sortOrder);
  const created = await FolderRepo.findByIdAndUserId(id, userId);
  if (!created) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '생성 실패');
  }
  return toResponse(created);
}

async function updateFolder(
  id: number,
  params: UpdateFolderParams,
  userId: number,
): Promise<FolderResponse> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 폴더 ID입니다.');
  }

  const mine = await FolderRepo.findByIdAndUserId(id, userId);
  if (!mine) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }

  const title = assertTitle(params.title);
  const sortOrder =
    params.sortOrder == null ? mine.sortOrder : Number(params.sortOrder);

  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 정렬 순서입니다.');
  }

  if (await FolderRepo.existsByUserAndTitle(userId, title, id)) {
    throw new RouteError(HttpStatusCodes.CONFLICT, '이미 존재하는 폴더명입니다.');
  }

  const updatedRows = await FolderRepo.updateFolder(id, userId, title, sortOrder);
  if (updatedRows !== 1) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }

  const updated = await FolderRepo.findByIdAndUserId(id, userId);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }
  return toResponse(updated);
}

async function deleteFolder(id: number, userId: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 폴더 ID입니다.');
  }

  const mine = await FolderRepo.findByIdAndUserId(id, userId);
  if (!mine) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }

  const deleted = await FolderRepo.deleteFolder(id, userId);
  if (deleted !== 1) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }
}

async function assertOwnedFolder(
  folderId: number,
  userId: number,
): Promise<FolderRow> {
  if (!Number.isFinite(folderId) || folderId <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '잘못된 폴더 ID입니다.');
  }
  const folder = await FolderRepo.findByIdAndUserId(folderId, userId);
  if (!folder) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, '폴더를 찾을 수 없습니다.');
  }
  return folder;
}

export default {
  getAllFoldersByUserId,
  createFolder,
  updateFolder,
  deleteFolder,
  assertOwnedFolder,
};
