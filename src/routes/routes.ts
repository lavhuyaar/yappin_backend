import { Router } from 'express';
import userRoutes from './userRoutes';
import chatRoutes from './chatRoutes';

const routes = Router();
routes.use('/user', userRoutes);
routes.use('/chat', chatRoutes);

export default routes;
