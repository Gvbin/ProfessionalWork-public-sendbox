const request = require('supertest');
const { app, server } = require('../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Nettoyer la base de données avant tous les tests
beforeAll(async () => {
  await prisma.user.deleteMany({});
});

// Fermer les connexions après tous les tests pour éviter que Jest ne reste bloqué
afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe('Auth Routes', () => {
  const testUser = {
    email: 'test.jest@example.com',
    password: 'password123',
    name: 'Jest User',
  };

  it('should sign up a new user successfully', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not sign up a user that already exists', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('User already exists');
  });

  it('should log in an existing user successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not log in with an incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});