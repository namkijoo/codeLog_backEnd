import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import AuthRepo from '#src/repos/AuthRepo.ts';

export type SignupInput = {
  name: string;
  username: string;
  password: string;
};
export type LoginInput = {
  username: string;
  password: string;
};

async function signup(input: SignupInput): Promise<void> {
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const { password } = input;

  if (!name || !username || !password) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, '필수 값이 없습니다.');
  }

  if (password.length < 8) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '비밀번호는 8자 이상이어야 합니다.',
    );
  }

  const exists = await AuthRepo.findByUsername(username);
  if (exists) {
    throw new RouteError(
      HttpStatusCodes.CONFLICT,
      '이미 존재하는 사용자입니다.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await AuthRepo.createUser({ name, username, password_hash: passwordHash });
}

async function login(input: LoginInput): Promise<{ accessToken: string }> {
  const { username, password } = input;

  if (!username || !password) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'username/password가 필요합니다.',
    );
  }

  const user = await AuthRepo.findByUsername(username);
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    );
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'JWT_SECRET이 없습니다.',
    );
  }
  const accessToken = jwt.sign(
    { sub: String(user.id), username: user.username },
    secret,
    { expiresIn: '7d' },
  );
  return { accessToken };
}

export default {
  signup,
  login,
};
