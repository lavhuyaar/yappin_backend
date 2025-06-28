import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { messageValidator } from '../validators/messageValidators';
import { validationResult } from 'express-validator';
import { createMessage } from '../db/queries/messageQueries';
import { getChatById } from '../db/queries/chatQueries';

export const postNewMessage = [
  ...messageValidator,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      res.status(403).json({
        message: 'Unauthorized action',
      });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(409).json({
        errors: errors.array(),
      });
      return;
    }

    const { receiverId, content, chatId } = req.body;

    const chat = await getChatById(chatId);

    if (!chat) {
      res.status(404).json({
        message:
          'Cannot send message as there exists no chat between sender and receiver!',
      });

      return;
    }

    const newMessage = await createMessage(userId, receiverId, chatId, content);

    if (!newMessage) {
      res.status(404).json({
        message: 'Failed to send the message!',
      });
      return;
    }

    res.status(201).json({
      message: 'Message sent successfully!',
      newMessage,
    });
    return;
  },
];
