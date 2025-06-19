import db from '../db';

export const createChat = async (userOneId: string, userTwoId: string) => {
  const chat = await db.chat.create({
    data: {
      users: {
        connect: [{ id: userOneId }, { id: userTwoId }],
      },
    },
  });

  return chat;
};
