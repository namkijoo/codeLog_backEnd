import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';

export type AuthUser = {
  id: number;
  username: string;
};

export type AuthedRequest<P = Record<string, string>> = Request<P> & {
  user: AuthUser;
};

type JwtPayload = {
  sub: string;
  username: string;
};

export function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(
      new RouteError(HttpStatusCodes.UNAUTHORIZED, '로그인이 필요합니다.'),
    );
  }

  const token = header.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(
      new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'JWT_SECRET이 없습니다.',
      ),
    );
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    const id = Number(payload.sub);
    if (!Number.isFinite(id) || !payload.username) {
      return next(
        new RouteError(
          HttpStatusCodes.UNAUTHORIZED,
          '유효하지 않은 토큰입니다.',
        ),
      );
    }

    req.user = { id, username: payload.username };
    return next();
  } catch {
    return next(
      new RouteError(HttpStatusCodes.UNAUTHORIZED, '유효하지 않은 토큰입니다.'),
    );
  }
}
