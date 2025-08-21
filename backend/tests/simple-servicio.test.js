const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');
const Servicio = require('../models/Servicio');
const jwt = require('jsonwebtoken');

describe('Simple Servicio Controller Tests', () => {
  let userToken, userId;

  beforeAll(async () => {
    // Crear usuario
    const user = new Usuario({
      email: 'test@test.com',
      password: 'password123',
      nombre: 'Test User',
      telefono: '123456789',
      rol: 'usuario'
    });
    await user.save();
    userId = user._id;
    userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secreto');
  });

  afterAll(async () => {
    await Usuario.deleteMany({});
    await Servicio.deleteMany({});
  });

  beforeEach(async () => {
    await Servicio.deleteMany({});
  });

  test('should trigger validation paths in crearServicio', async () => {
    // Test sin nombre
    await request(app)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ descripcion: 'Solo descripcion' });

    // Test sin descripcion
    await request(app)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Solo nombre' });

    // Test sin ambos campos
    await request(app)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
  });

  test('should trigger eliminarServicio paths', async () => {
    // Test con ID inexistente
    const fakeId = '507f1f77bcf86cd799439011';
    await request(app)
      .delete(`/api/servicios/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Crear servicio y eliminarlo
    const servicio = new Servicio({
      nombre: 'Test Service',
      descripcion: 'Test description'
    });
    await servicio.save();

    await request(app)
      .delete(`/api/servicios/${servicio._id}`)
      .set('Authorization', `Bearer ${userToken}`);
  });
});
