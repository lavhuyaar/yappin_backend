import db from '../db';

export const createMessage = async (
  senderId: string,
  receiverId: string,
  chatId: string,
  content: string,
) => {
  const message = await db.message.create({
    data: {
      senderId,
      receiverId,
      chatId,
      content,
    },
  });

  return message;
};
