# docker/development/redis/Dockerfile
FROM redis:7.2.7-alpine3.21

LABEL org.opencontainers.image.description="Redis — development"

COPY redis.conf /usr/local/etc/redis/redis.conf

EXPOSE 6379

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD redis-cli ping || exit 1

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]