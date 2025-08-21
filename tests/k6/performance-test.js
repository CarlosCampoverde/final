import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, BASE_THRESHOLDS, HEADERS, generateUniqueEmail, generateUniqueService } from './config.js';

export const options = {
  scenarios: {
    // RAMP/LOAD Test - Usuarios
    ramp_usuarios: {
      executor: 'ramping-vus',
      exec: 'usuariosTest',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '2m', target: 30 },
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'ramp_usuarios' },
    },
    
    // SPIKE Test - Servicios
    spike_servicios: {
      executor: 'ramping-vus',
      exec: 'serviciosTest',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 200 }, // Spike rápido
        { duration: '1m', target: 200 },  // Mantener carga
        { duration: '15s', target: 0 },   // Bajar rápido
      ],
      startTime: '8m', // Comienza después del ramp test
      tags: { test_type: 'spike_servicios' },
    },
    
    // SOAK Test - Reservas (versión corta para CI)
    soak_reservas: {
      executor: 'constant-vus',
      exec: 'reservasTest',
      vus: 20,
      duration: '10m', // Versión corta para CI
      startTime: '10m', // Comienza después del spike
      tags: { test_type: 'soak_reservas' },
    },
  },
  
  thresholds: {
    ...BASE_THRESHOLDS,
    // Thresholds específicos por escenario
    'http_req_duration{test_type:ramp_usuarios}': ['p(95)<400'],
    'http_req_duration{test_type:spike_servicios}': ['p(95)<800'],
    'http_req_duration{test_type:soak_reservas}': ['p(95)<600'],
    
    'http_req_failed{test_type:ramp_usuarios}': ['rate<0.01'],
    'http_req_failed{test_type:spike_servicios}': ['rate<0.02'],
    'http_req_failed{test_type:soak_reservas}': ['rate<0.015'],
    
    'checks{test_type:ramp_usuarios}': ['rate>0.99'],
    'checks{test_type:spike_servicios}': ['rate>0.98'],
    'checks{test_type:soak_reservas}': ['rate>0.99'],
  },
};

// Test para módulo de Usuarios
export function usuariosTest() {
  const email = generateUniqueEmail();
  
  // Registro
  const registroPayload = JSON.stringify({
    nombre: 'Usuario Test',
    email: email,
    password: 'password123'
  });

  const registroResponse = http.post(
    `${BASE_URL}/api/usuarios/registro`,
    registroPayload,
    { headers: HEADERS, tags: { name: 'registro_usuario' } }
  );

  check(registroResponse, {
    'registro status is 201': (r) => r.status === 201,
    'registro response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Login
  const loginPayload = JSON.stringify({
    email: email,
    password: 'password123'
  });

  const loginResponse = http.post(
    `${BASE_URL}/api/usuarios/login`,
    loginPayload,
    { headers: HEADERS, tags: { name: 'login_usuario' } }
  );

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => JSON.parse(r.body).token,
  });

  sleep(1);
}

// Test para módulo de Servicios
export function serviciosTest() {
  // Listar servicios
  const listResponse = http.get(
    `${BASE_URL}/api/servicios`,
    { tags: { name: 'list_servicios' } }
  );
  
  check(listResponse, {
    'list servicios status is 200': (r) => r.status === 200,
    'list servicios response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(0.3);

  // Crear usuario para autenticación
  const email = generateUniqueEmail();
  const registroPayload = JSON.stringify({
    nombre: 'Servicio Test User',
    email: email,
    password: 'password123'
  });

  const registroResponse = http.post(
    `${BASE_URL}/api/usuarios/registro`,
    registroPayload,
    { headers: HEADERS }
  );

  if (registroResponse.status === 201) {
    const loginPayload = JSON.stringify({
      email: email,
      password: 'password123'
    });

    const loginResponse = http.post(
      `${BASE_URL}/api/usuarios/login`,
      loginPayload,
      { headers: HEADERS }
    );

    if (loginResponse.status === 200) {
      const token = JSON.parse(loginResponse.body).token;
      const authHeaders = {
        ...HEADERS,
        'Authorization': `Bearer ${token}`
      };

      // Crear servicio
      const servicioData = generateUniqueService();
      const createPayload = JSON.stringify(servicioData);

      const createResponse = http.post(
        `${BASE_URL}/api/servicios`,
        createPayload,
        { headers: authHeaders, tags: { name: 'create_servicio' } }
      );

      check(createResponse, {
        'create servicio status is 201': (r) => r.status === 201,
        'create servicio response time < 600ms': (r) => r.timings.duration < 600,
      });
    }
  }

  sleep(1);
}

// Test para módulo de Reservas
export function reservasTest() {
  // Setup para reservas
  const email = generateUniqueEmail();
  const registroPayload = JSON.stringify({
    nombre: 'Reserva Test User',
    email: email,
    password: 'password123'
  });

  const registroResponse = http.post(
    `${BASE_URL}/api/usuarios/registro`,
    registroPayload,
    { headers: HEADERS }
  );

  if (registroResponse.status !== 201) {
    sleep(2);
    return;
  }

  const loginPayload = JSON.stringify({
    email: email,
    password: 'password123'
  });

  const loginResponse = http.post(
    `${BASE_URL}/api/usuarios/login`,
    loginPayload,
    { headers: HEADERS }
  );

  if (loginResponse.status !== 200) {
    sleep(2);
    return;
  }

  const token = JSON.parse(loginResponse.body).token;
  const authHeaders = {
    ...HEADERS,
    'Authorization': `Bearer ${token}`
  };

  // Crear servicio para las reservas
  const servicioData = generateUniqueService();
  const servicioPayload = JSON.stringify(servicioData);

  const servicioResponse = http.post(
    `${BASE_URL}/api/servicios`,
    servicioPayload,
    { headers: authHeaders }
  );

  if (servicioResponse.status === 201) {
    const responseBody = JSON.parse(servicioResponse.body);
    const servicioId = responseBody._id || responseBody.servicio?._id;

    if (servicioId) {
      // Listar reservas
      const listResponse = http.get(
        `${BASE_URL}/api/reservas`,
        { headers: authHeaders, tags: { name: 'list_reservas' } }
      );

      check(listResponse, {
        'list reservas status is 200': (r) => r.status === 200,
        'list reservas response time < 400ms': (r) => r.timings.duration < 400,
      });

      sleep(1);

      // Crear reserva
      const now = new Date();
      const fechaInicio = new Date(now.getTime() + Math.random() * 86400000 * 7);
      const fechaFin = new Date(fechaInicio.getTime() + 3600000);

      const reservaPayload = JSON.stringify({
        servicio: servicioId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        estado: 'pendiente'
      });

      const createResponse = http.post(
        `${BASE_URL}/api/reservas`,
        reservaPayload,
        { headers: authHeaders, tags: { name: 'create_reserva' } }
      );

      check(createResponse, {
        'create reserva status is 201': (r) => r.status === 201,
        'create reserva response time < 800ms': (r) => r.timings.duration < 800,
      });
    }
  }

  sleep(2);
}
