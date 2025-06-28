import request from 'supertest';
import app from '../app';
import db from '../db/db';
import generateMockedUser from '../utils/generateMockedUser';
import generateMockedToken from '../utils/generateMockedToken';
import { User } from '@prisma/client';

describe('POST /user/login', () => {
  const mockedUser = generateMockedUser();

  const userCredentials = {
    username: mockedUser.username,
    password: mockedUser.password,
  };

  // Adds a mocked user
  beforeAll(async () => {
    await request(app).post('/user/register').send(mockedUser);
  });

  //Deletes the mocked user
  afterAll(async () => {
    await db.user.delete({
      where: {
        username: mockedUser.username,
      },
    });
  });

  it('should return a token and user details with username and password', async () => {
    const response = await request(app)
      .post('/user/login')
      .send(userCredentials);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  it('should throw a error when username is invalid', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ ...userCredentials, username: 'Wrong username' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("This username doesn't exists!");
  });

  it('should return a error when password is incorrect', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ ...userCredentials, password: 'Wrong Password' });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Incorrect password!');
  });

  it('should return a error when username is missing', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ ...userCredentials, username: '' });

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Username must be between 2 and 30 characters',
    );
  });

  it('should return a error when password is missing', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ ...userCredentials, password: '' });

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Password must be atleast 6 letters',
    );
  });
});

describe('POST /user/register', () => {
  let createdUsername: string | null = null;

  afterEach(async () => {
    if (createdUsername) {
      await db.user.delete({
        where: { username: createdUsername },
      });
      createdUsername = null;
    }
  });

  it('should create a new user with appropriate data', async () => {
    const userData = generateMockedUser();

    const response = await request(app).post('/user/register').send(userData);

    expect(response.status).toEqual(201);
    expect(response.body.message).toBe('User registered successfully!');
    createdUsername = userData.username;
  });

  it('should throw error when firstName is missing', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(generateMockedUser({ firstName: '' }));

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'First name must be between 2 and 30 characters',
    );
  });

  it('should throw error when lastName is missing', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(generateMockedUser({ lastName: '' }));

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Last name must be between 2 and 30 characters',
    );
  });

  it('should throw error when username is missing', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(generateMockedUser({ username: '' }));

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Username must be between 2 and 30 characters',
    );
  });

  it('should throw error when password is missing', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(generateMockedUser({ password: '' }));

    expect(response.status).toBe(409);
    expect(response.body.errors[0].msg).toBe(
      'Password must be atleast 6 letters',
    );
  });

  it('should throw error when there already username already exists', async () => {
    const userData = generateMockedUser();

    // 1st request
    await request(app).post('/user/register').send(userData);
    createdUsername = userData.username;

    // 2nd request
    const response2 = await request(app).post('/user/register').send(userData);

    expect(response2.status).toBe(409);
    expect(response2.body.message).toBe('Username already exists!');
  });
});

describe('GET /user', () => {
  const mockedUserA = generateMockedUser();
  const mockedUserB = generateMockedUser();
  const mockedUserC = generateMockedUser();

  let token: string;
  let userAId: string;
  let userBId: string;
  let userCId: string;

  beforeAll(async () => {
    const userA = await db.user.create({ data: mockedUserA });
    userAId = userA.id;
    const userB = await db.user.create({ data: mockedUserB });
    userBId = userB.id;
    const userC = await db.user.create({ data: mockedUserC });
    userCId = userC.id;
    token = generateMockedToken(userC);
  });

  afterAll(async () => {
    await db.user.deleteMany({
      where: {
        id: {
          in: [userAId, userBId, userCId],
        },
      },
    });
  });

  it('should return users with whom one can have conversation', async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("should skip logged in User's data", async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(
      response.body.users.some((user: User) => user?.id === userCId),
    ).toBeFalsy();
  });

  it('should throw an error if there is no bearer token', async () => {
    const response = await request(app).get(`/user`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Token not found');
  });
});
