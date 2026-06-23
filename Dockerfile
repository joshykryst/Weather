FROM node:22-alpine AS builder
WORKDIR /app

# Build frontend
COPY frontend/package*.json frontend/
WORKDIR /app/frontend
RUN apk add --no-cache git python3 make g++ || true
RUN npm install --no-audit || true
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

# Copy built frontend into backend
COPY --from=builder /app/frontend/build ./build

ENV NODE_ENV=production
CMD ["node", "server.js"]