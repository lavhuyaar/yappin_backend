import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== undefined) {
    const bearerToken = bearerHeader?.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).json({
      message: 'Token not found!',
    });
    return;
  }
};

export default verifyToken;
