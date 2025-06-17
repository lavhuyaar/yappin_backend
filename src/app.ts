import express, { Request } from 'express';
import cors from 'cors';

import routes from './routes/routes';

import errorHandler from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.urlencoded());
app.use(express.json());

const allowedLists: (string | undefined)[] = []; //Add allowed lists

const corsOptionsDelegate = (req: Request, callback: Function) => {
  let corsOptions;
  if (allowedLists.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

app.use(routes);
app.use(userRoutes);

//Global error handler
app.use(errorHandler);

export default app;
