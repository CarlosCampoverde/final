const app = require('./app');

// Railway usa PORT dinámico, localhost usa 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Conectado a MongoDB');
  console.log(`Backend running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode enabled');
  } else {
    console.log(`Backend en http://localhost:${PORT}`);
  }
});
