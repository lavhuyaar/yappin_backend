import { Router } from 'express';
import verifyUser from '../middlewares/verifyUser';
import { createNewChat, getChats } from '../controllers/chatController';
import verifyToken from '../middlewares/verifyToken';

const chatRoutes = Router();

chatRoutes.use(verifyToken);
chatRoutes.use(verifyUser);
chatRoutes.get('/', getChats);
chatRoutes.get('/chat/:userBId', createNewChat);

export default chatRoutes;
