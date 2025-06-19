import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/userController';

const userRoutes = Router();

userRoutes.post('/user/register', registerUser);
userRoutes.post('/user/login', loginUser);

export default userRoutes;
