import request from 'supertest';
import app from '../app';
import generateMockedUser from '../utils/generateMockedUser';
import db from '../db/db';
import { createChat } from '../db/queries/chatQueries';
import generateMockedToken from '../utils/generateMockedToken';

describe('POST /message', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();

  let mockedUserAId: string;
  let mockedUserBId: string;
  let chatId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const userA = await db.user.create({ data: mockedUserA });
    mockedUserAId = userA.id;

    const userB = await db.user.create({ data: mockedUserB });
    mockedUserBId = userB.id;

    // Mocked JWT Token(s)
    tokenA = generateMockedToken(userA);
    tokenB = generateMockedToken(userB);

    // Creates a chat
    const chat = await createChat(mockedUserAId, mockedUserBId);
    chatId = chat.id;
  });

  afterAll(async () => {
    // Deletes chat
    await db.chat.delete({
      where: {
        id: chatId,
      },
    });

    // Deletes mocked users
    await db.user.deleteMany({
      where: {
        username: {
          in: [mockedUserA.username, mockedUserB.username],
        },
      },
    });
  });

  it('should create a message sent by User A', async () => {
    const response = await request(app)
      .post('/message')
      .send({
        content: 'First message',
        receiverId: mockedUserBId,
        chatId,
      })
      .set('Authorization', `Beader ${tokenA}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Message sent successfully!');
  });

  it('should create a message sent by User B', async () => {
    const response = await request(app)
      .post('/message')
      .send({
        content: 'First message',
        receiverId: mockedUserAId,
        chatId,
      })
      .set('Authorization', `Beader ${tokenB}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Message sent successfully!');
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).post('/message').send({
      content: 'First message',
      receiverId: mockedUserAId,
      chatId,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found');
  });

  it('should throw an error if there is no message content', async () => {
    const response = await request(app).post('/message').send({
      content: '',
      receiverId: mockedUserAId,
      chatId,
    });

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Message must contain atleast 1 letter',
    );
  });

  it('should return 2 as the messages length in the chat', async () => {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });

    expect(chat?.messages.length).toBe(2);
  });
});
