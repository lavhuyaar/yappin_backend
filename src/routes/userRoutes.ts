import { Router } from 'express';
import { registerUser } from '../controllers/userController';

const userRoutes = Router();

userRoutes.post('/user/register', registerUser);
// userRoutes.post('/user/login');

export default userRoutes;
