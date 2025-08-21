import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, BASE_THRESHOLDS, HEADERS, generateUniqueService, generateUniqueEmail, safeParseJSON } from '../config.js';

// SPIKE Test - Salto brusco de carga
export const options = {
  scenarios: {
    spike_servicios: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 300 }, // Spike: 0 → 300 VUs en 15s
        { duration: '2m', target: 300 }, // Mantener 300 VUs por 2 minutos
        { duration: '15s', target: 0 }, // Bajar: 300 → 0 VUs en 15s
      ],
    },
  },
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],      // < 1%
    'checks': ['rate>0.99'],               // > 99%
  },
};

let globalAuthToken = '';

export function setup() {
  console.log('Setting up spike test - creating admin user...');
  
  // Setup: Crear usuario administrador para crear servicios
  const adminEmail = generateUniqueEmail();
  
  const registroPayload = JSON.stringify({
    nombre: 'Admin Performance Test',
    email: adminEmail,
    password: 'admin123'
  });

  const registroResponse = http.post(
    `${BASE_URL}/api/usuarios/registro`,
    registroPayload,
    { headers: HEADERS }
  );

  if (registroResponse.status === 201) {
    const loginPayload = JSON.stringify({
      email: adminEmail,
      password: 'admin123'
    });

    const loginResponse = http.post(
      `${BASE_URL}/api/usuarios/login`,
      loginPayload,
      { headers: HEADERS }
    );

    if (loginResponse.status === 200) {
      const body = safeParseJSON(loginResponse);
      if (body && body.token) {
        globalAuthToken = body.token;
        console.log('Setup completed successfully');
        return { token: globalAuthToken };
      }
    }
  }
  
  console.log('Setup failed - tests will run without auth');
  return { token: '' };
}

export default function (data) {
  const token = data.token;
  
  // Test 1: Listar servicios (sin autenticación)
  const listResponse = http.get(`${BASE_URL}/api/servicios`);
  
  check(listResponse, {
    'list servicios status is 200': (r) => r.status === 200,
    'list servicios response time < 400ms': (r) => r.timings.duration < 400,
    'list servicios returns array': (r) => {
      const body = safeParseJSON(r);
      return Array.isArray(body);
    },
  });

  sleep(0.5);

  // Test 2: Crear servicio (con autenticación)
  if (token) {
    const authHeaders = {
      ...HEADERS,
      'Authorization': `Bearer ${token}`
    };

    const servicioData = generateUniqueService();
    const createPayload = JSON.stringify(servicioData);

    const createResponse = http.post(
      `${BASE_URL}/api/servicios`,
      createPayload,
      { headers: authHeaders }
    );

    check(createResponse, {
      'create servicio status is 201': (r) => r.status === 201,
      'create servicio response time < 800ms': (r) => r.timings.duration < 800,
      'create servicio has id': (r) => {
        if (r.status !== 201) return false;
        const body = safeParseJSON(r);
        return body && (body._id || body.servicio?._id);
      },
    });

    // Test 3: Buscar servicio por ID (si se creó exitosamente)
    if (createResponse.status === 201) {
      const responseBody = safeParseJSON(createResponse);
      const servicioId = responseBody && (responseBody._id || responseBody.servicio?._id);

      if (servicioId) {
        sleep(0.3);
        
        const getResponse = http.get(
          `${BASE_URL}/api/servicios/${servicioId}`,
          { headers: authHeaders }
        );

        check(getResponse, {
          'get servicio status is 200': (r) => r.status === 200,
          'get servicio response time < 300ms': (r) => r.timings.duration < 300,
          'get servicio returns correct data': (r) => {
            if (r.status !== 200) return false;
            const body = safeParseJSON(r);
            return body && body._id === servicioId;
          },
        });
      }
    }
  }

  sleep(1);
}

export function teardown(data) {
  console.log('Spike test completed');
}
