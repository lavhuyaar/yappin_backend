import request from 'supertest';
import db from '../db/db';
import app from '../app';
import generateMockedUser from '../utils/generateMockedUser';
import generateMockedToken from '../utils/generateMockedToken';
import { createChat } from '../db/queries/chatQueries';

describe('GET /chats/chat/:userBId', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();

  let mockedUserAToken: string;
  let userAId: string;
  let userBId: string;

  let chatId: string | undefined = undefined;

  //Creates mocked users
  beforeAll(async () => {
    const user1 = await db.user.create({ data: mockedUserA });
    userAId = user1.id;
    mockedUserAToken = generateMockedToken(user1); //Mocked JWT Token

    const user2 = await db.user.create({ data: mockedUserB });
    userBId = user2.id;
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
      .get(`/chats/chat/${userBId}`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    chatId = response.body.chat.id;

    expect(response.status).toBe(201);
    expect(response.body.chat).toBeDefined();
    expect(response.body.message).toBe('Chat created successfully!');
  });

  it('should throw an error if IDs of User A and User B are same', async () => {
    const response = await request(app)
      .get(`/chats/chat/${userAId}`)
      .set('Authorization', `Bearer ${mockedUserAToken}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Chat cannot be created with yourself!');
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).get(`/chats/chat/${userBId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found');
  });
});

describe('GET /chats', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();
  const mockedUserC = generateMockedUser();

  let token: string;

  let chatABId: string;
  let chatACId: string;

  //Creates mocked users
  beforeAll(async () => {
    const userA = await db.user.create({ data: mockedUserA });
    token = generateMockedToken(userA); //Mocked JWT Token
    const userB = await db.user.create({ data: mockedUserB });
    const userC = await db.user.create({ data: mockedUserC });

    const chatAB = await createChat(userA.id, userB.id);
    chatABId = chatAB.id;
    const chatAC = await createChat(userA.id, userC.id);
    chatACId = chatAC.id;
  });

  afterAll(async () => {
    // Deletes mocked chats
    await db.chat.deleteMany({
      where: {
        id: {
          in: [chatABId, chatACId],
        },
      },
    });

    // Deletes mocked users
    await db.user.deleteMany({
      where: {
        username: {
          in: [
            mockedUserA.username,
            mockedUserB.username,
            mockedUserC.username,
          ],
        },
      },
    });
  });

  it('should get all chats of user', async () => {
    const response = await request(app)
      .get('/chats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.chats.length).toBe(2);
    expect(response.body.chats).toBeDefined();
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).get(`/chats`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found');
  });
});
