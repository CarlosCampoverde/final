# Proyecto3Parcial

[![CI/CD Pipeline](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial/branch/main/graph/badge.svg)](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial)

Sistema de gestión de reservas de gimnasio con backend en Node.js y frontend web.

## 🚀 URLs de Despliegue

### 🌐 Producción
- **Backend API**: https://proyectop2preubas-production.railway.app
- **Frontend**: https://CarlosCampoverde.github.io/Proyecto3Parcial
- **API Health Check**: https://proyectop2preubas-production.railway.app/api/health

### 🧪 Staging
- **Backend API**: https://proyectop2preubas-staging.railway.app
- **Frontend**: https://deploy-preview-main--proyectop2preubas.netlify.app

## 🏗️ CI/CD Pipeline

Este proyecto implementa un pipeline completo de CI/CD con GitHub Actions:

### ✅ **Continuous Integration (CI)**
- **Pruebas Unitarias**: Jest con cobertura > 70%
- **Linting**: Verificación de calidad de código
- **Seguridad**: Auditoría de dependencias vulnerables
- **Rendimiento**: Pruebas k6 con thresholds estrictos
- **Multi-Node**: Testing en Node.js 18.x y 20.x

### 🚀 **Continuous Deployment (CD)**
Despliegue automático **solo si CI + k6 pasan**:

1. **Backend API** → Railway/Render
2. **Frontend** → Vercel/Netlify/GitHub Pages  
3. **Docker Image** → GitHub Container Registry

### 📊 **Pruebas de Rendimiento k6**
- **RAMP Test**: 10→100 usuarios en 12min (usuarios)
- **SPIKE Test**: 0→300 usuarios en 15s (servicios)
- **SOAK Test**: 50 usuarios durante 30min (reservas)
- **Thresholds**: p(95)<500ms, error<1%, checks>99%

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Testing**: Jest + Supertest + k6
- **CI/CD**: GitHub Actions
- **Deploy**: Railway + Vercel + Docker
- **Monitoring**: Health checks + performance metrics

## 🧪 Ejecutar Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar backend
npm start

# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas de rendimiento
npm run perf:all

# Ejecutar pruebas específicas
npm run perf:ramp    # Test RAMP
npm run perf:spike   # Test SPIKE  
npm run perf:soak    # Test SOAK
```

## � Despliegue con Docker

```bash
# Build imagen
docker build -t proyectop2preubas .

# Ejecutar container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongo_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  proyectop2preubas
```

## 📈 Monitoreo y Métricas

- **Health Check**: `/api/health`
- **Performance Reports**: Artifacts en GitHub Actions
- **Coverage Reports**: Codecov integration
- **Error Tracking**: Console logs + GitHub Issues

## 🔐 Variables de Entorno

Para despliegue en producción, configurar estos secrets:

```bash
# Backend
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
NODE_ENV=production

# Deploy Platforms
RAILWAY_TOKEN=your-railway-token
VERCEL_TOKEN=your-vercel-token
NETLIFY_AUTH_TOKEN=your-netlify-token

# Docker Registry
GHCR_PAT=your-github-token
```

## � Scripts Disponibles

```bash
# Testing
npm test              # Unit tests + coverage
npm run test:watch    # Watch mode
npm run test:ci       # CI mode

# Performance
npm run perf          # All scenarios
npm run perf:ramp     # Ramp test
npm run perf:spike    # Spike test
npm run perf:soak     # Soak test

# PowerShell scripts
.\run-all-k6-tests.ps1     # All k6 tests
.\run-parallel-k6-tests.ps1  # Parallel execution
.\run-strict-k6-tests.ps1    # Strict thresholds
```

## 🎯 Criterios de Despliegue

El despliegue automático se ejecuta **SOLO SI**:
- ✅ Todas las pruebas unitarias pasan
- ✅ Cobertura de código > 70%
- ✅ Auditoría de seguridad pasa
- ✅ Pruebas k6 cumplen thresholds
- ✅ Push a rama `main`

¡Sistema listo para producción! 🚀
- **CI/CD**: GitHub Actions
