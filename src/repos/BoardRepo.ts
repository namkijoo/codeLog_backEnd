import { pool } from './db.ts';

export type BoardRow = {
  id: number;
  userId: number;
  username: string;
  problemNumber: number;
  problemUrl: string;
  platformName: string;
  tags: string[] | string; // mysql2가 JSON을 string으로 줄 수도 있음
  difficulty: string;
  title: string;
  memo: string;
  language: string;
  code: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

async function findAllByUserId(userId: number): Promise<BoardRow[]> {
  const [rows] = await pool.execute('SELECT * FROM boards WHERE userId = ?', [
    userId,
  ]);
  return rows as BoardRow[];
}

async function createBoard(
  board: Omit<BoardRow, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO boards (userId, username, problemNumber, problemUrl, platformName, tags, difficulty, title, memo, language, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      board.userId,
      board.username,
      board.problemNumber,
      board.problemUrl,
      board.platformName,
      board.tags,
      board.difficulty,
      board.title,
      board.memo,
      board.language,
      board.code,
    ],
  );
  return Number((result as { insertId: number }).insertId);
}

async function updateBoard(
  board: Omit<BoardRow, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  await pool.execute(
    'UPDATE boards SET username = ?, problemNumber = ?, problemUrl = ?, platformName = ?, tags = ?, difficulty = ?, title = ?, memo = ?, language = ?, code = ? WHERE id = ?',
    [
      board.username,
      board.problemNumber,
      board.problemUrl,
      board.platformName,
      board.tags,
      board.difficulty,
      board.title,
      board.memo,
      board.language,
      board.code,
      board.id,
    ],
  );
}

async function deleteBoard(id: number): Promise<void> {
  await pool.execute('DELETE FROM boards WHERE id = ?', [id]);
}

export default {
  findAllByUserId,
  createBoard,
  updateBoard,
  deleteBoard,
};
