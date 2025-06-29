import db from '../db';

interface IUserToRegister {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  profilePicture?: string;
}

export const createNewUser = async ({
  username,
  firstName,
  lastName,
  password,
  profilePicture,
}: IUserToRegister) => {
  const data: IUserToRegister = {
    username,
    firstName,
    lastName,
    password,
  };

  if (profilePicture) {
    data.profilePicture = profilePicture;
  }

  const user = await db.user.create({
    data,
  });

  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};

export const getOtherUsers = async (id: string) => {
  const users = await db.user.findMany({
    where: {
      NOT: {
        id,
      },
    },
    omit: {
      password: true,
    },
  });

  return users;
};

export const updateUser = async (
  id: string,
  username: string,
  firstName: string,
  lastName: string,
  profilePicture?: string | null,
) => {
  const data = {
    firstName,
    lastName,
    username,
    profilePicture,
  };

  const user = await db.user.update({
    where: {
      id,
    },
    data,
  });

  return user;
};
