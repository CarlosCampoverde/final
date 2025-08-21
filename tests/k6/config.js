// Configuración base para pruebas k6
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Thresholds obligatorios según especificaciones
export const BASE_THRESHOLDS = {
  'http_req_duration{expected_response:true}': ['p(95)<500'], // 95% de requests < 500ms
  'http_req_failed': ['rate<0.01'], // Error rate < 1%
  'checks': ['rate>0.99'], // Success rate > 99%
};

// Headers comunes
export const HEADERS = {
  'Content-Type': 'application/json',
};

// Función para generar email único
export function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `perf${timestamp}${random}@test.com`;
}

// Función para generar datos únicos de servicio
export function generateUniqueService() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return {
    nombre: `Servicio Performance ${timestamp}-${random}`,
    descripcion: `Servicio de prueba de rendimiento generado en ${timestamp}`,
    precio: Math.floor(Math.random() * 500) + 50
  };
}

// Función para manejar respuestas JSON de forma segura
export function safeParseJSON(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.log(`Error parsing JSON. Status: ${response.status}, Body: ${response.body.substring(0, 200)}`);
    return null;
  }
}
