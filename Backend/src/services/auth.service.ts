import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiResponse';
import bcrypt from 'bcryptjs';

export async function register(username: string, password: string, email?: string) {
	const exists = await User.findOne({ $or: [{ username }, { email }] });
	if (exists) throw new ApiError(409, 'User already exists');
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ username, email, passwordHash });
	const token = generateToken(user.id);
	return { user: sanitize(user), token };
}

export async function login(identifier: string, password: string) {
	const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
	if (!user) throw new ApiError(401, 'Invalid credentials');
	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) throw new ApiError(401, 'Invalid credentials');
	const token = generateToken(user.id);
	return { user: sanitize(user), token };
}

function generateToken(userId: string) {
	const options: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
	return jwt.sign({ sub: userId }, env.JWT_SECRET as jwt.Secret, options);
}

function sanitize(user: any) {
	const { _id, username, displayName, email, roles, createdAt, updatedAt } = user.toObject();
	return { id: _id, username, displayName, email, roles, createdAt, updatedAt };
}
