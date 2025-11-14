// lib/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { dbConnect } from './dbConnect';
import UserModel, { IUser } from '../models/User';

const TOKEN_NAME = 'token';

export function setTokenCookie(res: NextApiResponse, token: string) {
  const serialized = cookie.serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.setHeader('Set-Cookie', serialized);
}

export function removeTokenCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', cookie.serialize(TOKEN_NAME, '', { maxAge: -1, path: '/' }));
}

export async function getUserFromReq(req: NextApiRequest) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[TOKEN_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { sub: string; email?: string };
    await dbConnect();
    const user = await UserModel.findById(payload.sub).lean();
    return user || null;
  } catch (err) {
    return null;
  }
}
