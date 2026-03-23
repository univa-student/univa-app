# docker/development/nginx/Dockerfile
FROM nginx:1.25.5-alpine3.21

LABEL org.opencontainers.image.description="Nginx reverse proxy — development"


RUN rm /etc/nginx/conf.d/default.conf

# В dev конфиги монтируются через volume (docker-compose.yml),
# COPY нужен только для production-образа
COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80 443