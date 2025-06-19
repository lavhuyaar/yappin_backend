import request from 'supertest';
import app from '../app';
import db from '../db/db';
import generateMockedUser from '../utils/generateMockedUser';

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
