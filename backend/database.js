require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');

// Configurar URI de MongoDB según el entorno
let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

// Si no hay URI configurada y estamos en testing, usar una base de datos en memoria o por defecto
if (!uri) {
  if (process.env.NODE_ENV === 'test') {
    uri = 'mongodb://localhost:27017/gym_web_test';
    console.log('Using default test database URI');
  } else if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  MONGODB_URI is required for production!');
    process.exit(1);
  } else {
    console.warn('MONGO_URI not found in environment variables');
    uri = 'mongodb://localhost:27017/gym_web_default';
  }
}

mongoose.connect(uri)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Conectado a MongoDB');
    }
  })
  .catch(err => {
    console.error('Error en conexión MongoDB:', err);
    // En entorno de testing, no fallar si no se puede conectar a la BD
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });

module.exports = mongoose;
