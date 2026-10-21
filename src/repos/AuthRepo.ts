import { pool } from '#src/repos/db.ts';

export type AuthUserRow = {
  id: number;
  name: string;
  username: string;
  password_hash: string;
};

async function findByUsername(
  username: string,
): Promise<AuthUserRow | undefined> {
  const [rows] = await pool.execute(
    'SELECT id, name, username, password_hash From users WHERE username = ? LIMIT 1',
    [username],
  );
  return (rows as AuthUserRow[])[0];
}

async function createUser(user: Omit<AuthUserRow, 'id'>): Promise<void> {
  await pool.execute(
    'INSERT INTO users (name, username, password_hash) VALUES (?, ?, ?)',
    [user.name, user.username, user.password_hash],
  );
}

export default {
  findByUsername,
  createUser,
};
