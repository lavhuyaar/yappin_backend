import db from '../db';

interface UserToRegister {
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
}: UserToRegister) => {
  const data: UserToRegister = {
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
