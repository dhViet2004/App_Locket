import { Request, Response } from 'express';
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

/**
 * Gửi OTP đến số điện thoại hoặc email
 * POST /api/auth/send-otp
 * Body: { identifier: string } - phone hoặc email
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
	const { identifier } = req.body as { identifier: string };

	if (!identifier) {
		return res.status(400).json({ success: false, message: 'Phone number or email is required' });
	}

	const result = await AuthService.sendOTP(identifier);
	return res.status(200).json(ok(result, 'OTP sent successfully'));
});

/**
 * Xác thực OTP
 * POST /api/auth/verify-otp
 * Body: { identifier: string, code: string } - identifier là phone hoặc email
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
	const { identifier, code } = req.body as { identifier: string; code: string };

	if (!identifier || !code) {
		return res.status(400).json({ success: false, message: 'Phone/email and OTP code are required' });
	}

	const result = await AuthService.verifyOTP(identifier, code);
	return res.status(200).json(ok(result, 'OTP verified successfully'));
});

/**
 * Đặt lại mật khẩu sau khi verify OTP
 * POST /api/auth/reset-password
 * Body: { identifier: string, code: string, newPassword: string }
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
	const { identifier, code, newPassword } = req.body as { identifier: string; code: string; newPassword: string };

	if (!identifier || !code || !newPassword) {
		return res.status(400).json({ success: false, message: 'Phone/email, OTP code, and new password are required' });
	}

	if (newPassword.length < 6) {
		return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
	}

	const result = await AuthService.resetPassword(identifier, code, newPassword);
	return res.status(200).json(ok(result, 'Password reset successfully'));
});