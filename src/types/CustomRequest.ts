import { Request } from 'express';

export type CustomRequest = Request & {
  token?: string;
  authorId?: string;
  userId?: string;
};
