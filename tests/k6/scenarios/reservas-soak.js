import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, BASE_THRESHOLDS, HEADERS, generateUniqueEmail, generateUniqueService, safeParseJSON } from '../config.js';

// SOAK/ENDURANCE Test - Carga sostenida
export const options = {
  scenarios: {
    soak_reservas: {
      executor: 'constant-vus',
      vus: 50, // 50 usuarios virtuales constantes
      duration: '30m', // Durante 30 minutos (ajustable a 60m para producción)
    },
  },
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],      // < 1%
    'checks': ['rate>0.99'],               // > 99%
  },
};

let setupData = {};

export function setup() {
  console.log('Setting up soak test data...');
  
  // Crear usuario de prueba
  const userEmail = generateUniqueEmail();
  const registroPayload = JSON.stringify({
    nombre: 'Soak Test User',
    email: userEmail,
    password: 'soak123'
  });

  const registroResponse = http.post(
    `${BASE_URL}/api/usuarios/registro`,
    registroPayload,
    { headers: HEADERS }
  );

  let userToken = '';
  let userId = '';

  if (registroResponse.status === 201) {
    const userData = safeParseJSON(registroResponse);
    if (userData && userData.usuario) {
      userId = userData.usuario._id;
    }

    const loginPayload = JSON.stringify({
      email: userEmail,
      password: 'soak123'
    });

    const loginResponse = http.post(
      `${BASE_URL}/api/usuarios/login`,
      loginPayload,
      { headers: HEADERS }
    );

    if (loginResponse.status === 200) {
      const loginData = safeParseJSON(loginResponse);
      if (loginData && loginData.token) {
        userToken = loginData.token;
      }
    }
  }

  // Crear servicio de prueba
  let servicioId = '';
  if (userToken) {
    const servicioData = generateUniqueService();
    const servicioPayload = JSON.stringify(servicioData);
    const authHeaders = {
      ...HEADERS,
      'Authorization': `Bearer ${userToken}`
    };

    const servicioResponse = http.post(
      `${BASE_URL}/api/servicios`,
      servicioPayload,
      { headers: authHeaders }
    );

    if (servicioResponse.status === 201) {
      const responseBody = safeParseJSON(servicioResponse);
      if (responseBody) {
        servicioId = responseBody._id || responseBody.servicio?._id;
      }
    }
  }

  console.log(`Setup completed. Token: ${userToken ? 'OK' : 'FAILED'}, ServiceId: ${servicioId ? 'OK' : 'FAILED'}`);

  return {
    userToken,
    userId,
    servicioId,
    userEmail
  };
}

export default function (data) {
  if (!data.userToken || !data.servicioId) {
    console.log('Setup data missing, skipping iteration');
    sleep(5);
    return;
  }

  const authHeaders = {
    ...HEADERS,
    'Authorization': `Bearer ${data.userToken}`
  };

  // Test 1: Listar reservas del usuario
  const listResponse = http.get(
    `${BASE_URL}/api/reservas`,
    { headers: authHeaders }
  );

  check(listResponse, {
    'list reservas status is 200': (r) => r.status === 200,
    'list reservas response time < 500ms': (r) => r.timings.duration < 500,
    'list reservas returns array': (r) => {
      const body = safeParseJSON(r);
      return Array.isArray(body);
    },
  });

  sleep(1);

  // Test 2: Crear nueva reserva
  const now = new Date();
  const fechaInicio = new Date(now.getTime() + Math.random() * 86400000 * 7); // Próximos 7 días
  const fechaFin = new Date(fechaInicio.getTime() + 3600000); // 1 hora después

  const reservaPayload = JSON.stringify({
    servicio: data.servicioId,
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    estado: 'pendiente'
  });

  const createResponse = http.post(
    `${BASE_URL}/api/reservas`,
    reservaPayload,
    { headers: authHeaders }
  );

  check(createResponse, {
    'create reserva status is 201': (r) => r.status === 201,
    'create reserva response time < 1000ms': (r) => r.timings.duration < 1000,
    'create reserva has id': (r) => {
      if (r.status !== 201) return false;
      const body = safeParseJSON(r);
      return body && (body._id || body.reserva?._id);
    },
  });

  let reservaId = '';
  if (createResponse.status === 201) {
    const responseBody = safeParseJSON(createResponse);
    if (responseBody) {
      reservaId = responseBody._id || responseBody.reserva?._id;
    }
  }

  sleep(2);

  // Test 3: Obtener reserva específica (si se creó exitosamente)
  if (reservaId) {
    const getResponse = http.get(
      `${BASE_URL}/api/reservas/${reservaId}`,
      { headers: authHeaders }
    );

    check(getResponse, {
      'get reserva status is 200': (r) => r.status === 200,
      'get reserva response time < 400ms': (r) => r.timings.duration < 400,
      'get reserva returns correct data': (r) => {
        if (r.status !== 200) return false;
        const body = safeParseJSON(r);
        return body && body._id === reservaId;
      },
    });

    sleep(1);

    // Test 4: Actualizar estado de reserva
    const updatePayload = JSON.stringify({
      estado: 'confirmada'
    });

    const updateResponse = http.put(
      `${BASE_URL}/api/reservas/${reservaId}`,
      updatePayload,
      { headers: authHeaders }
    );

    check(updateResponse, {
      'update reserva status is 200': (r) => r.status === 200,
      'update reserva response time < 600ms': (r) => r.timings.duration < 600,
      'update reserva changed status': (r) => {
        if (r.status !== 200) return false;
        const body = safeParseJSON(r);
        return body && (body.estado === 'confirmada' || body.reserva?.estado === 'confirmada');
      },
    });
  }

  // Pausa entre iteraciones para simular comportamiento real de usuario
  sleep(Math.random() * 3 + 2); // 2-5 segundos aleatorios
}

export function teardown(data) {
  console.log('Soak test completed - endurance testing finished');
}
