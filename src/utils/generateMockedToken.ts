import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

const generateMockedToken = (user: User) => {
  const token: string = jwt.sign({ user }, SECRET_KEY, {
    expiresIn: '7 days',
  });

  return token;
};
export default generateMockedToken;
