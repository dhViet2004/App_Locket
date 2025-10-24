import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { ok } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
	const { username, password, email } = req.body as { username: string; password: string; email?: string };
	const result = await AuthService.register(username, password, email);
	return res.status(201).json(ok(result, 'registered'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const { identifier, password } = req.body as { identifier: string; password: string };
	const result = await AuthService.login(identifier, password);
	return res.json(ok(result, 'logged-in'));
});
