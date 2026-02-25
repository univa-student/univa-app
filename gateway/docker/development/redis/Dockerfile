# docker/development/redis/Dockerfile
FROM redis:7.2-alpine

# Кастомный конфиг (опционально)
# COPY redis.conf /usr/local/etc/redis/redis.conf

# В dev maxmemory не ограничиваем, но можно добавить для реалистичности:
CMD ["redis-server", "--save", "60", "1", "--loglevel", "warning"]