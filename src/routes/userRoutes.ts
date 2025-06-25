import { Router } from 'express';
import {
  getUsersToTalk,
  loginUser,
  registerUser,
} from '../controllers/userController';
import verifyToken from '../middlewares/verifyToken';
import verifyUser from '../middlewares/verifyUser';

const userRoutes = Router();

userRoutes.get('/', verifyToken, verifyUser, getUsersToTalk);
userRoutes.post('/register', registerUser);
userRoutes.post('/login', loginUser);

export default userRoutes;
