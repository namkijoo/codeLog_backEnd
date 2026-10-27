import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import BoardRepo, { type BoardRow } from '#src/repos/BoardRepo.ts';

export type CreateBoardParams = {
  problemNumber: number;
  problemUrl: string;
  platformName: string;
  tags: string[];
  difficulty: string;
  title: string;
  language: string;
  code: string;
  memo?: string;
};

export type BoardResponse = {
  id: number;
  username: string;
  problemNumber: number;
  problemUrl: string;
  platformName: string;
  tags: string[];
  difficulty: string;
  title: string;
  memo: string;
  language: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

function parseTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function toResponse(row: BoardRow): BoardResponse {
  return {
    id: row.id,
    username: row.username,
    problemNumber: row.problemNumber,
    problemUrl: row.problemUrl,
    platformName: row.platformName,
    tags: parseTags(row.tags),
    difficulty: row.difficulty,
    title: row.title,
    memo: row.memo,
    language: row.language,
    code: row.code,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function assertBoardRequest(board: CreateBoardParams): void {
  if (
    !Number.isFinite(board.problemNumber) ||
    !board.platformName?.trim() ||
    !Array.isArray(board.tags) ||
    !board.difficulty?.trim() ||
    !board.title?.trim() ||
    !board.language?.trim() ||
    !board.code?.trim()
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '필수 값이 없습니다.');
  }
}

async function getAllBoardsByUserId(userId: number): Promise<BoardResponse[]> {
  const rows = await BoardRepo.findAllByUserId(userId);
  return rows.map(toResponse);
}

async function createBoard(
  board: CreateBoardParams,
  userId: number,
  username: string,
): Promise<BoardResponse> {
  assertBoardRequest(board);
  const id = await BoardRepo.createBoard({
    userId,
    username,
    problemNumber: board.problemNumber,
    problemUrl: board.problemUrl,
    platformName: board.platformName,
    tags: JSON.stringify(board.tags),
    difficulty: board.difficulty,
    title: board.title,
    memo: board.memo ?? '',
    language: board.language,
    code: board.code,
  });

  const rows = await BoardRepo.findAllByUserId(userId);
  const created = rows.find((r) => r.id === id);
  if (!created) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '생성 실패');
  }
  return toResponse(created);
}

async function updateBoard(
  board: CreateBoardParams,
  userId: number,
  id: number,
): Promise<BoardResponse> {
  assertBoardRequest(board);

  const mine = (await BoardRepo.findAllByUserId(userId)).find(
    (b) => b.id === id,
  );
  if (!mine) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      '게시글을 찾을 수 없습니다.',
    );
  }

  await BoardRepo.updateBoard({
    ...mine,
    problemNumber: board.problemNumber,
    problemUrl: board.problemUrl ?? '',
    platformName: board.platformName,
    tags: JSON.stringify(board.tags),
    difficulty: board.difficulty,
    title: board.title,
    memo: board.memo ?? '',
    language: board.language,
    code: board.code,
  });

  const updated = (await BoardRepo.findAllByUserId(userId)).find(
    (b) => b.id === id,
  );
  if (!updated) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      '게시글을 찾을 수 없습니다.',
    );
  }
  return toResponse(updated);
}

async function deleteBoard(id: number, userId: number): Promise<void> {
  const mine = (await BoardRepo.findAllByUserId(userId)).find(
    (b) => b.id === id,
  );
  if (!mine) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      '게시글을 찾을 수 없습니다.',
    );
  }

  await BoardRepo.deleteBoard(id);
}

export default {
  getAllBoardsByUserId,
  createBoard,
  updateBoard,
  deleteBoard,
};
