// Detectar si estamos en producción o desarrollo
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://final-production.up.railway.app/api';

function register() {
  fetch(`${API}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: document.getElementById('nombre').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      rol: document.getElementById('rol').value
    })
  }).then(res => res.json()).then(alert);
}

function login() {
  fetch(`${API}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  }).then(res => res.json()).then(data => {
    localStorage.setItem('token', data.token);
    window.location = 'dashboard.html';
  });
}

function cargarServicios() {
  fetch(`${API}/servicios`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('servicio');
      data.forEach(s => {
        const option = document.createElement('option');
        option.value = s._id;
        option.textContent = s.nombre;
        select.appendChild(option);
      });
    });
}

function reservar() {
  const token = localStorage.getItem('token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  fetch(`${API}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuarioId: payload.id,
      servicioId: document.getElementById('servicio').value,
      fecha: document.getElementById('fecha').value,
      hora: document.getElementById('hora').value
    })
  }).then(res => res.json()).then(alert);
}

function cargarReservas() {
  const token = localStorage.getItem('token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  fetch(`${API}/reservas/${payload.id}`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('misReservas');
      data.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `Reserva: ${r.fecha} a las ${r.hora}`;
        ul.appendChild(li);
      });
    });
}

if (document.getElementById('bienvenida')) {
  const token = localStorage.getItem('token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  document.getElementById('bienvenida').textContent = `Bienvenido usuario ${payload.id}`;
  cargarServicios();
  cargarReservas();
}
