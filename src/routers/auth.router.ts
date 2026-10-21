import { Router } from 'express';

import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import AuthService from '#src/services/AuthService.ts';

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, username, password } = req.body as {
    name?: string;
    username?: string;
    password?: string;
  };

  await AuthService.signup({
    name: name ?? '',
    username: username ?? '',
    password: password ?? '',
  });

  return res.status(HttpStatusCodes.CREATED).json({ message: '회원가입 완료' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  const result = await AuthService.login({
    username: username ?? '',
    password: password ?? '',
  });

  return res.status(HttpStatusCodes.OK).json(result);
});

export default router;
