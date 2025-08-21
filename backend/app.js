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

// Health check endpoint for Railway and k6 tests
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    
    // Estados: 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };

    const healthData = {
      status: dbStatus === 1 ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      service: 'ProyectoP2Preubas API',
      database: {
        status: dbStatusText[dbStatus] || 'unknown',
        connected: dbStatus === 1
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    };

    // Si la DB está conectada, responder 200, sino 503
    const statusCode = dbStatus === 1 ? 200 : 503;
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ProyectoP2Preubas API',
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Health check simple para Railway (sin verificar DB)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'ProyectoP2Preubas API',
    timestamp: new Date().toISOString()
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
