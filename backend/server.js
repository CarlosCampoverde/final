const app = require('./app');

// Railway usa PORT dinámico, localhost usa 3000
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Conectado a MongoDB');
  console.log(`Backend running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode enabled');
    console.log(`Health check available at: /health`);
  } else {
    console.log(`Backend en http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  }
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
