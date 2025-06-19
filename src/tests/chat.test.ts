import request from 'supertest';
import db from '../db/db';
import app from '../app';
import generateMockedUser from '../utils/generateMockedUser';
import generateMockedToken from '../utils/generateMockedToken';

describe('GET /chat/:userBId', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();

  let mockedUserAToken: string;
  let mockedUserAId: string;
  let mockedUserBId: string;

  let chatId: string | undefined = undefined;

  //Creates mocked users
  beforeAll(async () => {
    const user1 = await db.user.create({ data: mockedUserA });
    mockedUserAId = user1.id;
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
      .get(`/chat/${mockedUserBId}`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    chatId = response.body.chat.id;

    expect(response.status).toBe(201);
    expect(response.body.chat).toBeDefined();
    expect(response.body.message).toBe('Chat created successfully!');
  });

  it('should throw an error if IDs of User A and User B are same', async () => {
    const response = await request(app)
      .get(`/chat/${mockedUserAId}`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Chat cannot be created with yourself!');
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).get(`/chat/${mockedUserBId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found');
  });
});
