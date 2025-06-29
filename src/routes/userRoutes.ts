import { Router } from 'express';

import {
  editUserProfile,
  getUsersToTalk,
  loginUser,
  registerUser,
} from '../controllers/userController';

import verifyToken from '../middlewares/verifyToken';
import verifyUser from '../middlewares/verifyUser';
import multerHandler from '../middlewares/multerHandler';

const userRoutes = Router();

userRoutes.post('/register', registerUser);
userRoutes.post('/login', loginUser);
userRoutes.use(verifyToken);
userRoutes.use(verifyUser);
userRoutes.get('/', getUsersToTalk);
userRoutes.put('/profile', multerHandler, editUserProfile);

export default userRoutes;
