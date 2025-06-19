import request from 'supertest';
import app from '../app';
import db from '../db/db';
import generateMockedUser from '../utils/generateMockedUser';

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
