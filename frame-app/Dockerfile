# --- Stage 1: build the frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: runtime image ---
FROM node:20-slim
WORKDIR /app

# Python (for yt-dlp) + ffmpeg (yt-dlp uses it for merging when a quality
# needs it) + curl (for the container healthcheck).
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip ffmpeg curl ca-certificates && \
    pip3 install --no-cache-dir --break-system-packages -U yt-dlp && \
    rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:8787/api/health || exit 1

CMD ["node", "backend/src/server.js"]
