import { pool } from './db.ts';

export type NoteRow = {
  id: number;
  folderId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

async function findAllByFolderId(
  folderId: number,
  userId: number,
): Promise<NoteRow[]> {
  const [rows] = await pool.execute(
    `SELECT id, folderId, userId, title, content, createdAt, updatedAt
     FROM notes
     WHERE folderId = ? AND userId = ?
     ORDER BY updatedAt DESC, id DESC`,
    [folderId, userId],
  );
  return rows as NoteRow[];
}

async function findByIdAndUserId(
  id: number,
  userId: number,
): Promise<NoteRow | null> {
  const [rows] = await pool.execute(
    `SELECT id, folderId, userId, title, content, createdAt, updatedAt
     FROM notes
     WHERE id = ? AND userId = ?
     LIMIT 1`,
    [id, userId],
  );
  const list = rows as NoteRow[];
  return list[0] ?? null;
}

async function createNote(
  folderId: number,
  userId: number,
  title: string,
  content: string,
): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO notes (folderId, userId, title, content) VALUES (?, ?, ?, ?)',
    [folderId, userId, title, content],
  );
  return Number((result as { insertId: number }).insertId);
}

async function updateNote(
  id: number,
  userId: number,
  title: string,
  content: string,
): Promise<number> {
  const [result] = await pool.execute(
    'UPDATE notes SET title = ?, content = ? WHERE id = ? AND userId = ?',
    [title, content, id, userId],
  );
  return Number((result as { affectedRows: number }).affectedRows);
}

async function deleteNote(id: number, userId: number): Promise<number> {
  const [result] = await pool.execute(
    'DELETE FROM notes WHERE id = ? AND userId = ?',
    [id, userId],
  );
  return Number((result as { affectedRows: number }).affectedRows);
}

export default {
  findAllByFolderId,
  findByIdAndUserId,
  createNote,
  updateNote,
  deleteNote,
};
