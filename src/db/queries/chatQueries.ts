import db from '../db';

export const createChat = async (userAId: string, userBId: string) => {
  const [sortedIdA, sortedIdB] = [userAId, userBId].sort();

  const chat = await db.chat.create({
    data: {
      userAId: sortedIdA,
      userBId: sortedIdB,
    },
    include: {
      userA: {
        omit: {
          password: true,
        },
      },
      userB: {
        omit: {
          password: true,
        },
      },
      messages: {
        select: {
          sender: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          content: true,
          id: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return chat;
};

export const getChatByUserIds = async (userAId: string, userBId: string) => {
  const [sortedIdA, sortedIdB] = [userAId, userBId].sort();

  const chat = await db.chat.findUnique({
    where: {
      userAId_userBId: {
        userAId: sortedIdA,
        userBId: sortedIdB,
      },
    },
    include: {
      userA: {
        omit: {
          password: true,
        },
      },
      userB: {
        omit: {
          password: true,
        },
      },
      messages: {
        select: {
          sender: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          content: true,
          id: true,
          createdAt: true,
          updatedAt: true,
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

  return chat;
};

export const getChatsByUserId = async (userId: string) => {
  const chats = await db.chat.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      messages: { some: {} },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      userA: {
        omit: {
          password: true,
        },
      },
      userB: {
        omit: {
          password: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,

        select: {
          sender: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              username: true,
              profilePicture: true,
            },
          },
          content: true,
          id: true,
          updatedAt: true,
          createdAt: true,
        },
      },
    },
  });

  return chats;
};
