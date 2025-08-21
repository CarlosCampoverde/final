const app = require('./app');

app.listen(3000, () => {
  console.log('Conectado a MongoDB');
  console.log('Backend en http://localhost:3000');
});
