const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz con información de la API
app.get('/', (req, res) => {
  res.json({
    message: 'ProyectoP2Preubas API - Sistema de Gestión de Reservas de Gimnasio',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios',
      servicios: '/api/servicios',
      reservas: '/api/reservas'
    },
    frontend: '/frontend',
    documentation: 'https://github.com/CarlosCampoverde/final'
  });
});

// Health check endpoint for k6 tests
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ProyectoP2Preubas API'
  });
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));

// Ruta para servir el frontend
app.get('/frontend', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Manejar rutas del frontend específicas
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/registro.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

module.exports = app;  // 👈 exportamos la app sin levantar el servidor
