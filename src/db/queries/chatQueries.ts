import db from '../db';

export const createChat = async (userAId: string, userBId: string) => {
  const chat = await db.chat.create({
    data: {
      users: {
        connect: [{ id: userAId }, { id: userBId }],
      },
    },
  });

  return chat;
};

export const getChatByUserIds = async (userAId: string, userBId: string) => {
  const chat = await db.chat.findFirst({
    where: {
      AND: [
        { users: { some: { id: userAId } } },
        { users: { some: { id: userBId } } },
      ],
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      messages: {
        select: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
            },
          },
          content: true,
        },
      },
    },
  });

  return chat;
};

export const getChatById = async (chatId: string) => {
  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
    },
  });

  return chatId;
};
