# Dockerfile para ProyectoP2Preubas
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["node", "backend/server.js"]
