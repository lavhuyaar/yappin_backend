import { Router } from 'express';
import verifyUser from '../middlewares/verifyUser';
import { createNewChat } from '../controllers/chatController';
import { verifyToken } from '../middlewares/verifyToken';

const chatRoutes = Router();
chatRoutes.get('/:userBId', verifyToken, verifyUser, createNewChat);

export default chatRoutes;
