import request from 'supertest';
import db from '../db/db';
import app from '../app';
import generateMockedUser from '../utils/generateMockedUser';
import generateMockedToken from '../utils/generateMockedToken';

describe('POST /chat/create', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();

  let mockedUserAToken: string;
  let mockedUserBId: string;

  let chatId: string | undefined = undefined;

  //Creates mocked users
  beforeAll(async () => {
    const user1 = await db.user.create({ data: mockedUserA });
    mockedUserAToken = generateMockedToken(user1); //Mocked JWT Token

    const user2 = await db.user.create({ data: mockedUserB });
    mockedUserBId = user2.id;
  });

  afterAll(async () => {
    if (chatId) {
      await db.chat.delete({
        where: {
          id: chatId,
        },
      });
    }

    // Deletes mocked users
    await db.user.deleteMany({
      where: {
        username: {
          in: [mockedUserA.username, mockedUserB.username],
        },
      },
    });
  });

  it('should create a chat', async () => {
    const response = await request(app)
      .post(`/chat/create/${mockedUserBId}`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    chatId = response.body.chat.id;

    expect(response.status).toBe(201);
    expect(response.body.chat).toBeDefined();
    expect(response.body.message).toBe('Chat created successfully!');
  });

  it('should throw an error if no id of UserB is used as param', async () => {
    const response = await request(app)
      .post(`/chat/create`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User Id not found!');
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).post(`/chat/create`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found!');
  });
});
