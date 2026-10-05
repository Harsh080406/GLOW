# ===================================================
# GLOW Smart Campus Transit - Production Backend
# ===================================================
FROM node:20-alpine AS base

# Install curl/wget for health checks & tzdata for IST timezone
RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Kolkata

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code and default uploads directory
COPY src ./src
RUN mkdir -p uploads && chown -R node:node /app

# Run as non-root node user for security
USER node

# Expose backend API and WebSocket port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Container Healthcheck (pings health probe endpoint)
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || curl -f http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
