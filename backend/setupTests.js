require('dotenv').config({ path: __dirname + '/../.env' });

// Configurar el entorno como test
process.env.NODE_ENV = 'test';

// Configurar timeouts más largos para las pruebas
jest.setTimeout(15000);

// Configurar para que las pruebas usen una base de datos de test
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('test')) {
  process.env.MONGO_URI = process.env.MONGO_URI.replace(/\/[^\/]*$/, '/gym_web_test');
}
