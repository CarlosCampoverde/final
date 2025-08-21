const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./database');

const app = express();
app.use(cors());
app.use(express.json());

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

module.exports = app;  // 👈 exportamos la app sin levantar el servidor
