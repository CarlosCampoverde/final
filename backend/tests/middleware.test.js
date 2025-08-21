const jwt = require('jsonwebtoken');
const verificarToken = require('../middlewares/verificarToken');

describe('Middleware verificarToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('debería autenticar un token válido', async () => {
    const token = jwt.sign(
      { id: 'user123', rol: 'user' },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    req.headers.authorization = `Bearer ${token}`;

    verificarToken(req, res, next);

    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe('user123');
    expect(req.usuario.rol).toBe('user');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debería rechazar si no hay token', () => {
    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería rechazar token inválido', () => {
    req.headers.authorization = 'Bearer token_invalido';

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería rechazar token expirado', () => {
    const expiredToken = jwt.sign(
      { id: 'user123', rol: 'user' },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '-1h' } // Token expirado
    );

    req.headers.authorization = `Bearer ${expiredToken}`;

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería rechazar header de autorización con formato incorrecto', () => {
    req.headers.authorization = 'InvalidFormat token123';

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería rechazar header vacío', () => {
    req.headers.authorization = '';

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería rechazar solo "Bearer" sin token', () => {
    req.headers.authorization = 'Bearer ';

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });
});

const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});
