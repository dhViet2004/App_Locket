import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new ApiError(401, 'Missing or invalid Authorization header'));
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as any;
    req.userId = payload.sub as string;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
