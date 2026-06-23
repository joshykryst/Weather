FROM node:22-alpine AS builder
WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json frontend/
RUN apk add --no-cache git python3 make g++ || true
WORKDIR /app/frontend
RUN npm install --no-audit || true
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app/backend

# Install backend deps
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend build folder
COPY --from=builder /app/frontend/build ./build

ENV NODE_ENV=production

CMD ["node", "server.js"]