import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
	body: z.object({
		username: z.string().min(3),
		password: z.string().min(6),
		email: z.string().email().optional(),
	}),
});

const loginSchema = z.object({
	body: z.object({
		identifier: z.string().min(3),
		password: z.string().min(6),
	}),
});

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login', validate(loginSchema), authCtrl.login);

export default router;

