import { body } from 'express-validator';

export const messageValidator = [
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message must contain atleast 1 letter'),
  body('receiverId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Receiver Id cannot be empty'),
  body('chatId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Chat Id cannot be empty'),
];
