# 🚀 Pruebas de Rendimiento con k6

## 📁 Estructura de Archivos

```
tests/k6/
├── config.js                      # Configuración base y datos de prueba
├── performance-test.js             # Script maestro con todos los escenarios
├── summary-handler.js              # Generador de reportes personalizados
└── scenarios/
    ├── usuarios-ramp.js            # Escenario Ramp/Load para usuarios
    ├── servicios-spike.js          # Escenario Spike para servicios
    └── reservas-soak.js            # Escenario Soak/Endurance para reservas
```

## 🎯 Escenarios Implementados

### 1. **RAMP/LOAD Test - Módulo Usuarios**
- **Archivo**: `scenarios/usuarios-ramp.js`
- **Perfil de carga**: 10 → 100 VUs en 12 minutos
- **Pruebas**:
  - Registro de usuario
  - Login de usuario
  - Obtener perfil (autenticado)
- **Thresholds**:
  - `http_req_duration{expected_response:true}`: p(95) < 500ms
  - `http_req_failed`: rate < 1%
  - `checks`: rate > 99%

### 2. **SPIKE Test - Módulo Servicios**
- **Archivo**: `scenarios/servicios-spike.js`
- **Perfil de carga**: 0 → 300 VUs en 10s, mantener 1min, bajar en 10s
- **Pruebas**:
  - Listar servicios
  - Crear servicio (autenticado)
  - Obtener servicio por ID
- **Thresholds**:
  - `http_req_duration{expected_response:true}`: p(95) < 800ms (más tolerante)
  - `http_req_failed`: rate < 1%
  - `checks`: rate > 99%

### 3. **SOAK/ENDURANCE Test - Módulo Reservas**
- **Archivo**: `scenarios/reservas-soak.js`
- **Perfil de carga**: 50 VUs constantes durante 30 minutos
- **Pruebas**:
  - Listar reservas del usuario
  - Crear nueva reserva
  - Obtener reserva específica
  - Actualizar estado de reserva
- **Thresholds**:
  - `http_req_duration{expected_response:true}`: p(95) < 600ms
  - `http_req_failed`: rate < 2% (más tolerante para endurance)
  - `checks`: rate > 99%

## 🏃‍♂️ Comandos de Ejecución

### Ejecutar escenarios individuales:
```bash
# Ramp/Load Test - Usuarios
npm run perf:ramp

# Spike Test - Servicios  
npm run perf:spike

# Soak Test - Reservas
npm run perf:soak
```

### Ejecutar suite completa:
```bash
# Todos los escenarios en secuencia
npm run perf:all

# Script maestro con escenarios paralelos
npm run perf
```

### Ejecutar con k6 directamente:
```bash
# Con outputs personalizados
k6 run --out json=results.json --out html=report.html tests/k6/performance-test.js

# Solo escenario específico
k6 run tests/k6/scenarios/usuarios-ramp.js

# Con variables de entorno
BASE_URL=http://localhost:3000 k6 run tests/k6/performance-test.js
```

## 📊 Formatos de Salida Generados

### Automáticamente generados:
- **HTML Report**: `performance-summary.html` - Reporte visual interactivo
- **JSON Summary**: `performance-summary.json` - Datos estructurados
- **JUnit XML**: `performance-junit.xml` - Compatible con CI/CD
- **Console Output**: Resumen en texto con colores

### En CI/CD:
- **Artefactos GitHub**: Todos los reportes y logs
- **Logs de error**: Si algún threshold falla
- **Métricas por escenario**: Separadas por tags

## ⚙️ Configuración de CI/CD

### Trigger de ejecución:
- **Automático**: Push a rama `main`
- **Manual**: PRs etiquetados con `perf`

### Dependencias:
- Ejecuta **después** de unit tests
- **Falla** si thresholds no se cumplen
- **MongoDB** service para datos de prueba

### Timeouts y configuración:
- **Setup time**: 60s para que la app esté lista
- **Versión corta soak**: 5min en CI (30min en local)
- **Continue on error**: Tests individuales pueden fallar

## 🎛️ Configuración de Thresholds

### Globales (BASE_THRESHOLDS):
```javascript
{
  'http_req_duration{expected_response:true}': ['p(95)<500'],
  'http_req_failed': ['rate<0.01'],
  'checks': ['rate>0.99']
}
```

### Por escenario:
- **Ramp**: Más estricto (500ms, 1% error)
- **Spike**: Más tolerante (800ms, 2% error)
- **Soak**: Intermedio (600ms, 1.5% error)

## 🔧 Variables de Entorno

```bash
BASE_URL=http://localhost:3000    # URL base de la API
NODE_ENV=test                     # Entorno de pruebas
MONGODB_URI=mongodb://...         # URI de MongoDB para CI
JWT_SECRET=test-secret           # Secret para tokens JWT
```

## 📈 Métricas Monitoreadas

### HTTP Metrics:
- **Response Time**: p(50), p(95), p(99)
- **Error Rate**: Porcentaje de requests fallidos
- **Request Rate**: Requests por segundo
- **Data Transfer**: Bytes enviados/recibidos

### Check Metrics:
- **Success Rate**: Porcentaje de validaciones exitosas
- **Business Logic**: Validaciones específicas del negocio

### Custom Metrics:
- **Por endpoint**: Métricas separadas por ruta
- **Por escenario**: Métricas agrupadas por tipo de test
- **Por usuario virtual**: Comportamiento individual

## 🚨 Troubleshooting

### Errores comunes:
1. **Connection refused**: Verificar que la app esté ejecutándose
2. **Timeout**: Aumentar tiempo de setup en CI
3. **High error rate**: Revisar logs de la aplicación
4. **Memory leaks**: Monitorear en soak tests

### Debug tips:
```bash
# Ejecutar con verbose output
k6 run --verbose tests/k6/performance-test.js

# Solo 1 VU para debug
k6 run --vus 1 --duration 30s tests/k6/scenarios/usuarios-ramp.js

# Con archivo de log
k6 run --console-output=./k6.log tests/k6/performance-test.js
```

## 🎯 Criterios de Éxito

### ✅ Thresholds que DEBEN cumplirse:
- **P95 Response Time** < 500ms (ramp), < 800ms (spike), < 600ms (soak)
- **Error Rate** < 1-2% según escenario
- **Check Success Rate** > 99%

### 📊 Métricas objetivo:
- **Usuarios concurrentes**: Hasta 100 (ramp), 300 (spike), 50 (soak)
- **Requests por segundo**: > 50 RPS sostenidos
- **Estabilidad**: Sin degradación en soak test
- **Recuperación**: Vuelta a baseline después de spike

¡Las pruebas de rendimiento están listas para ejecutarse! 🚀
