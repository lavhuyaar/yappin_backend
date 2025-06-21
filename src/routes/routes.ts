import { Router } from 'express';
import userRoutes from './userRoutes';
import chatRoutes from './chatRoutes';
import messageRoutes from './messageRoutes';

const routes = Router();
routes.use('/user', userRoutes);
routes.use('/chat', chatRoutes);
routes.use('/message', messageRoutes);

export default routes;
