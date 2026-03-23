# docker/development/node/Dockerfile
FROM node:20.19-alpine3.21

LABEL org.opencontainers.image.description="Vite dev server — development"

ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app

# node_modules монтируется как named volume из docker-compose,
# поэтому COPY package*.json здесь не нужен — всё через volume

EXPOSE 5173

# npm ci при старте только если node_modules ещё не заполнен volume-ом.
# --host 0.0.0.0 обязателен — без него Vite слушает только внутри контейнера.
# --strictPort — падаем явно если 5173 занят.
CMD ["sh", "-c", "npm ci --prefer-offline --no-audit --no-fund && npx vite --host 0.0.0.0 --port 5173 --strictPort"]
