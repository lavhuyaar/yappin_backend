import { Router } from 'express';
import verifyUser from '../middlewares/verifyUser';
import { createNewChat } from '../controllers/chatController';
import verifyToken from '../middlewares/verifyToken';

const chatRoutes = Router();

chatRoutes.use(verifyToken);
chatRoutes.use(verifyUser);
chatRoutes.get('/:userBId', createNewChat);

export default chatRoutes;
