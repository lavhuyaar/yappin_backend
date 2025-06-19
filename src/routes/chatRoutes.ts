import { Router } from 'express';

const chatRoutes = Router();
chatRoutes.post('/create/:userBId');

export default chatRoutes;
