const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');

describe('Usuarios API - Registro y Login', () => {

  beforeEach(async () => {
    // Limpiar la colección de usuarios antes de cada prueba
    await Usuario.deleteMany({});
  });

  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app).post('/api/usuarios/register')
      .send({
        nombre: 'NuevoUsuario',
        email: `nuevo${Date.now()}@mail.com`,
        password: '123456',
        rol: 'user'
      });

    console.log('Response body:', res.body);
    console.log('Response status:', res.statusCode);

    expect(res.statusCode).toEqual(200);
    expect(res.body.mensaje).toBeDefined();
  });

  it('debería fallar con usuario no existente', async () => {
    const res = await request(app).post('/api/usuarios/login')
      .send({
        email: `inexistente${Date.now()}@mail.com`,
        password: '123456'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.mensaje).toBe('Usuario no encontrado');
  });

  it('debería fallar con contraseña incorrecta', async () => {
    // Primero registramos un usuario
    const email = `test${Date.now()}@mail.com`;
    await request(app).post('/api/usuarios/register')
      .send({
        nombre: 'Tester',
        email,
        password: '123456',
        rol: 'user'
      });

    // Intentamos loguear con contraseña incorrecta
    const res = await request(app).post('/api/usuarios/login')
      .send({
        email,
        password: 'passwordIncorrecta'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.mensaje).toBe('Contraseña incorrecta');
  });

});

const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});
