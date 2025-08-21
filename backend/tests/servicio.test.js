//hace una peticion GET para obtener con los servicio y obtener la lista se servicios
const request = require('supertest');
const app = require('../app');

describe('Servicios API', () => {
  it('debería obtener la lista de servicios', async () => {
    const res = await request(app).get('/api/servicios');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});
