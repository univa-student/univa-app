# docker/development/node/Dockerfile
# Alpine — минимальный образ (node:20-alpine ~ 180MB vs node:20 ~ 1GB)
FROM node:20-alpine

# WORKDIR=/app совпадает с путём, куда монтируется ${FRONTEND_PATH:-../frontend}
WORKDIR /app

# ИСПРАВЛЕНО: Путь был /frontend/node_modules/.bin — не совпадал с WORKDIR=/app.
# node_modules volume монтируется в /app/node_modules, поэтому PATH тоже /app/
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 5173

# npm install при старте — когда volume уже примонтирован и package.json виден.
# Если зависимости не изменились — npm install отработает за секунду (из кеша).
# --host 0.0.0.0 обязателен: иначе Vite слушает только 127.0.0.1 внутри контейнера
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]