# docker/development/node/Dockerfile
# Alpine — минимальный образ (node:20-alpine ~ 180MB vs node:20 ~ 1GB)
FROM node:20-alpine

# WORKDIR=/app совпадает с путём, куда монтируется ${FRONTEND_PATH:-./frontend}
WORKDIR /app

# PATH указывает на node_modules/.bin из именованного volume
# Volume монтируется в /app/node_modules при запуске контейнера
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 5173

# Запуск: npm ci (быстрее npm install, использует package-lock.json),
# затем запускаем vite напрямую через npx чтобы избежать проблем с
# передачей флагов через "npm run dev -- --host"
# --host 0.0.0.0 обязателен: без него Vite слушает только 127.0.0.1 внутри контейнера
# --strictPort: падаем явно если 5173 занят, а не переходим на 5174
CMD ["sh", "-c", "npm install --prefer-offline && npx vite --host 0.0.0.0 --port 5173 --strictPort"]