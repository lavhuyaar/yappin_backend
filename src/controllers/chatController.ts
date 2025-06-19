import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { createChat, getChatByUserIds } from '../db/queries/chatQueries';

export const createNewChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;
  const { userBId } = req.params;

  if (!userId) {
    res.status(403).json({
      message: 'Unauthorized action',
    });
    return;
  }

  if (userId === userBId) {
    res.status(409).json({
      message: 'Chat cannot be created with yourself!',
    });
    return;
  }

  const existingChat = await getChatByUserIds(userId, userBId);

  if (existingChat) {
    res.status(200).json({
      chat: existingChat,
      message: 'Chat found successfully!',
    });
    return;
  }

  const newChat = await createChat(userId, userBId);

  if (!newChat) {
    res.status(409).json({
      message: 'Failed to create a new chat!',
    });
    return;
  }

  res.status(201).json({
    message: 'Chat created successfully!',
    chat: newChat,
  });
  return;
};
