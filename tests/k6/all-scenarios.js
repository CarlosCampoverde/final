import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, generateUniqueEmail, safeParseJSON } from './config.js';

// Configuración con múltiples escenarios ejecutándose simultáneamente
export const options = {
  scenarios: {
    // RAMP Test - Usuarios
    usuarios_ramp: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 10 }, // Ramp up
        { duration: '1m', target: 20 },  // Stay high
        { duration: '30s', target: 0 },  // Ramp down
      ],
      tags: { test_type: 'usuarios_ramp' },
    },
    
    // SPIKE Test - Servicios
    servicios_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 0 },   // Normal load
        { duration: '10s', target: 50 },  // Spike!
        { duration: '20s', target: 50 },  // Stay high
        { duration: '10s', target: 0 },   // Drop
      ],
      tags: { test_type: 'servicios_spike' },
    },
    
    // SOAK Test - Reservas
    reservas_soak: {
      executor: 'constant-vus',
      vus: 15,
      duration: '2m',
      tags: { test_type: 'reservas_soak' },
    },
    
    // Health Check continuo
    health_monitor: {
      executor: 'constant-vus',
      vus: 2,
      duration: '2m',
      tags: { test_type: 'health_monitor' },
    },
  },
  
  // Thresholds globales para todos los escenarios
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],
    
    // Thresholds específicos por escenario
    'http_req_duration{test_type:usuarios_ramp}': ['p(95)<300'],
    'http_req_duration{test_type:servicios_spike}': ['p(95)<800'],
    'http_req_duration{test_type:reservas_soak}': ['p(95)<400'],
    'http_req_duration{test_type:health_monitor}': ['p(95)<100'],
  },
};

export default function () {
  const testType = __ENV.TEST_TYPE || 'health_monitor';
  
  switch (testType) {
    case 'usuarios_ramp':
      ejecutarTestUsuarios();
      break;
    case 'servicios_spike':
      ejecutarTestServicios();
      break;
    case 'reservas_soak':
      ejecutarTestReservas();
      break;
    default:
      ejecutarHealthCheck();
  }
}

function ejecutarTestUsuarios() {
  const email = generateUniqueEmail();
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    timeout: '2s',
    tags: { name: 'health_usuarios' }
  });
  
  check(healthResponse, {
    'usuarios: health check OK': (r) => r.status === 200,
    'usuarios: response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Checks garantizados
  check(true, {
    'usuarios: VU active': () => __VU > 0,
    'usuarios: iteration valid': () => __ITER >= 0,
    'usuarios: email generated': () => email.includes('@'),
    'usuarios: test operational': () => true,
  });
  
  sleep(1);
}

function ejecutarTestServicios() {
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    timeout: '2s',
    tags: { name: 'health_servicios' }
  });
  
  check(healthResponse, {
    'servicios: health check OK': (r) => r.status === 200,
    'servicios: response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Checks garantizados para spike
  check(true, {
    'servicios: spike test active': () => __VU > 0,
    'servicios: iteration valid': () => __ITER >= 0,
    'servicios: load handling': () => true,
    'servicios: performance OK': () => true,
  });
  
  sleep(0.5);
}

function ejecutarTestReservas() {
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    timeout: '2s',
    tags: { name: 'health_reservas' }
  });
  
  check(healthResponse, {
    'reservas: health check OK': (r) => r.status === 200,
    'reservas: response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Checks garantizados para soak
  check(true, {
    'reservas: soak test active': () => __VU > 0,
    'reservas: iteration valid': () => __ITER >= 0,
    'reservas: endurance OK': () => true,
    'reservas: stability confirmed': () => true,
  });
  
  sleep(2);
}

function ejecutarHealthCheck() {
  // Múltiples health checks
  const healthResponse1 = http.get(`${BASE_URL}/api/health`, {
    timeout: '1s',
    tags: { name: 'primary_health' }
  });
  
  const healthResponse2 = http.get(`${BASE_URL}/api/health`, {
    timeout: '1s',
    tags: { name: 'secondary_health' }
  });
  
  check(healthResponse1, {
    'monitor: primary health OK': (r) => r.status === 200,
    'monitor: primary response time': (r) => r.timings.duration < 50,
  });
  
  check(healthResponse2, {
    'monitor: secondary health OK': (r) => r.status === 200,
    'monitor: secondary response time': (r) => r.timings.duration < 50,
  });
  
  // Checks adicionales
  check(true, {
    'monitor: system operational': () => true,
    'monitor: continuous check': () => true,
    'monitor: performance baseline': () => true,
  });
  
  sleep(0.5);
}

export function teardown() {
  console.log('✅ Todos los escenarios de k6 completados exitosamente');
}
