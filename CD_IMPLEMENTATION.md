# 🚀 Guía de Despliegue Continuo (CD)

## 📋 Resumen

Este proyecto implementa un pipeline completo de CI/CD que despliega automáticamente **solo cuando todas las pruebas pasan**:

- ✅ Unit Tests (Jest)
- ✅ Linting y Seguridad
- ✅ Performance Tests (k6)
- ✅ Múltiples entornos de despliegue

## 🏗️ Arquitectura de Despliegue

```mermaid
graph TD
    A[Push to main] --> B[CI Tests]
    B --> C[k6 Performance]
    C --> D{All Pass?}
    D -->|Yes| E[Deploy Backend]
    D -->|Yes| F[Deploy Frontend]
    D -->|Yes| G[Build Docker]
    D -->|No| H[❌ Stop Pipeline]
    
    E --> I[Railway/Render]
    F --> J[Vercel/Netlify]
    G --> K[GHCR Registry]
```

## 🎯 Plataformas de Despliegue

### 1. **Backend API**

#### Opción A: Railway (Recomendado)
```bash
# Configurar secrets en GitHub:
RAILWAY_TOKEN=your_railway_token
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret
```

#### Opción B: Render
```bash
# Configurar secrets en GitHub:
RENDER_API_KEY=your_render_key
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret
```

### 2. **Frontend**

#### Opción A: Vercel (Recomendado)
```bash
# Configurar secrets en GitHub:
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_org_id
PROJECT_ID=your_project_id
```

#### Opción B: Netlify
```bash
# Configurar secrets en GitHub:
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

#### Opción C: GitHub Pages (Fallback)
- Se despliega automáticamente si no hay otros tokens
- URL: `https://username.github.io/repository-name`

### 3. **Docker Registry**

```bash
# Automático con GITHUB_TOKEN
# Imagen: ghcr.io/username/repository-name:latest
```

## ⚙️ Configuración de Secrets

En GitHub Repository → Settings → Secrets and variables → Actions:

### 🔐 Secrets Obligatorios
```bash
# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Autenticación
JWT_SECRET=tu-secret-super-seguro-aqui

# Plataforma de despliegue (elegir una)
RAILWAY_TOKEN=tu-railway-token
# O
RENDER_API_KEY=tu-render-api-key
# O  
VERCEL_TOKEN=tu-vercel-token
```

### 🔧 Secrets Opcionales
```bash
# Para frontend
ORG_ID=tu-vercel-org-id
PROJECT_ID=tu-vercel-project-id
NETLIFY_AUTH_TOKEN=tu-netlify-token

# Para Docker deploy
DEPLOY_HOST=tu-servidor.com
DEPLOY_USER=usuario
DEPLOY_KEY=-----BEGIN-RSA-PRIVATE-KEY-----
```

## 🎮 Comandos de Despliegue Manual

### Local Development
```bash
# Instalar
npm install

# Desarrollo
npm run dev

# Testing completo
npm test && npm run perf:all
```

### Railway Deploy
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render Deploy
```bash
# Conectar repo en render.com
# El archivo render.yaml maneja la configuración
```

### Docker Deploy
```bash
# Build
docker build -t proyectop2preubas .

# Run
docker run -p 3000:3000 \
  -e MONGODB_URI="$MONGODB_URI" \
  -e JWT_SECRET="$JWT_SECRET" \
  proyectop2preubas
```

## 🔄 Flujo de Trabajo

### 1. **Desarrollo**
```bash
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. **Pull Request**
- Se ejecutan todos los tests CI
- Se ejecutan pruebas k6
- **NO se despliega** (solo en main)

### 3. **Merge a Main**
```bash
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

### 4. **Deploy Automático**
- ✅ CI Tests pass → Deploy Backend
- ✅ k6 Tests pass → Deploy Frontend  
- ✅ Todo OK → Deploy Docker

## 📊 Monitoreo Post-Deploy

### Health Checks
```bash
# Backend
curl https://your-backend-url.com/api/health

# Frontend
curl https://your-frontend-url.com
```

### Performance Monitoring
- GitHub Actions artifacts
- Railway/Render dashboards
- Docker registry metrics

## 🚨 Troubleshooting

### Deploy Falla
1. Verificar secrets configurados
2. Revisar logs en GitHub Actions
3. Verificar que CI y k6 pasen

### Backend No Responde
1. Verificar `MONGODB_URI`
2. Verificar `JWT_SECRET`
3. Revisar logs de la plataforma

### Performance Tests Fallan
1. Verificar thresholds en `tests/k6/`
2. Ajustar si es necesario
3. Re-ejecutar tests localmente

## 🎯 Próximos Pasos

1. **Configurar Environment Protection Rules**
   - Staging environment
   - Production approval required

2. **Monitoring Avanzado**
   - Sentry para error tracking
   - Prometheus para métricas

3. **Blue-Green Deployment**
   - Zero-downtime deploys
   - Rollback automático

## 📚 Referencias

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [k6 Documentation](https://k6.io/docs/)

---

¡Pipeline de CD configurado y listo! 🚀
