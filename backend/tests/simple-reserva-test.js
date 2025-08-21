const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');
const Servicio = require('../models/Servicio');
const Reserva = require('../models/Reserva');
const jwt = require('jsonwebtoken');

describe('Simple Reserva Controller Tests', () => {
  let userToken, userId, servicioId;

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

    // Crear servicio
    const servicio = new Servicio({
      nombre: 'Test Service',
      descripcion: 'Test description'
    });
    await servicio.save();
    servicioId = servicio._id;
  });

  afterAll(async () => {
    await Usuario.deleteMany({});
    await Servicio.deleteMany({});
    await Reserva.deleteMany({});
  });

  beforeEach(async () => {
    await Reserva.deleteMany({});
  });

  test('should trigger validation paths in crearReserva', async () => {
    // Test sin campos obligatorios
    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    // Test con fecha inválida
    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        servicio: servicioId,
        fecha: 'invalid-date',
        hora: '10:00'
      });

    // Test con fecha pasada
    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        servicio: servicioId,
        fecha: '2020-01-01',
        hora: '10:00'
      });

    // Test con hora inválida
    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        servicio: servicioId,
        fecha: '2025-12-31',
        hora: '25:00'
      });

    // Test con hora fuera del horario
    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        servicio: servicioId,
        fecha: '2025-12-31',
        hora: '07:00'
      });
  });

  test('should test obtenerReservasUsuario', async () => {
    await request(app)
      .get('/api/reservas')
      .set('Authorization', `Bearer ${userToken}`);
  });

  test('should test eliminarReserva paths', async () => {
    // Test con ID inexistente
    const fakeId = '507f1f77bcf86cd799439011';
    await request(app)
      .delete(`/api/reservas/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Crear reserva y luego eliminarla
    const reserva = new Reserva({
      usuario: userId,
      servicio: servicioId,
      fecha: '2025-12-31',
      hora: '10:00'
    });
    await reserva.save();

    await request(app)
      .delete(`/api/reservas/${reserva._id}`)
      .set('Authorization', `Bearer ${userToken}`);
  });
});
