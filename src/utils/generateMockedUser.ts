const generateMockedUser = (overrides = {}) => {
  const user = {
    username: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    firstName: 'Dummy',
    lastName: 'User',
    password: '12345678',
    ...overrides,
  };
  return user;
};

export default generateMockedUser;
