import { pool } from './db.ts';

export type FolderRow = {
  id: number;
  userId: number;
  title: string;
  sortOrder: number;
  noteCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

async function findAllByUserId(userId: number): Promise<FolderRow[]> {
  const [rows] = await pool.execute(
    `SELECT f.id, f.userId, f.title, f.sortOrder, f.createdAt, f.updatedAt,
            COUNT(n.id) AS noteCount
     FROM folders f
     LEFT JOIN notes n ON n.folderId = f.id
     WHERE f.userId = ?
     GROUP BY f.id
     ORDER BY f.sortOrder ASC, f.id ASC`,
    [userId],
  );
  return rows as FolderRow[];
}

async function findByIdAndUserId(
  id: number,
  userId: number,
): Promise<FolderRow | null> {
  const [rows] = await pool.execute(
    `SELECT f.id, f.userId, f.title, f.sortOrder, f.createdAt, f.updatedAt,
            COUNT(n.id) AS noteCount
     FROM folders f
     LEFT JOIN notes n ON n.folderId = f.id
     WHERE f.id = ? AND f.userId = ?
     GROUP BY f.id`,
    [id, userId],
  );
  const list = rows as FolderRow[];
  return list[0] ?? null;
}

async function existsByUserAndTitle(
  userId: number,
  title: string,
  excludeId?: number,
): Promise<boolean> {
  const [rows] = await pool.execute(
    excludeId == null
      ? 'SELECT id FROM folders WHERE userId = ? AND title = ? LIMIT 1'
      : 'SELECT id FROM folders WHERE userId = ? AND title = ? AND id <> ? LIMIT 1',
    excludeId == null ? [userId, title] : [userId, title, excludeId],
  );
  return (rows as { id: number }[]).length > 0;
}

async function getNextSortOrder(userId: number): Promise<number> {
  const [rows] = await pool.execute(
    'SELECT COALESCE(MAX(sortOrder), -1) + 1 AS nextOrder FROM folders WHERE userId = ?',
    [userId],
  );
  return Number((rows as { nextOrder: number }[])[0].nextOrder);
}

async function createFolder(
  userId: number,
  title: string,
  sortOrder: number,
): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO folders (userId, title, sortOrder) VALUES (?, ?, ?)',
    [userId, title, sortOrder],
  );
  return Number((result as { insertId: number }).insertId);
}

async function updateFolder(
  id: number,
  userId: number,
  title: string,
  sortOrder: number,
): Promise<number> {
  const [result] = await pool.execute(
    'UPDATE folders SET title = ?, sortOrder = ? WHERE id = ? AND userId = ?',
    [title, sortOrder, id, userId],
  );
  return Number((result as { affectedRows: number }).affectedRows);
}

async function deleteFolder(id: number, userId: number): Promise<number> {
  const [result] = await pool.execute(
    'DELETE FROM folders WHERE id = ? AND userId = ?',
    [id, userId],
  );
  return Number((result as { affectedRows: number }).affectedRows);
}

export default {
  findAllByUserId,
  findByIdAndUserId,
  existsByUserAndTitle,
  getNextSortOrder,
  createFolder,
  updateFolder,
  deleteFolder,
};
