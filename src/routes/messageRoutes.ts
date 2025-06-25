import { Router } from 'express';
import { postNewMessage } from '../controllers/messageController';
import verifyToken from '../middlewares/verifyToken';
import verifyUser from '../middlewares/verifyUser';

const messageRoutes = Router();
messageRoutes.post('/', verifyToken, verifyUser, postNewMessage);

export default messageRoutes;
