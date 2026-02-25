# docker/development/nginx/Dockerfile
# Стабильная alpine-версия — минимальный образ для прокси
FROM nginx:1.25-alpine

# Удаляем дефолтный конфиг (будем монтировать свой через volume)
RUN rm /etc/nginx/conf.d/default.conf

# Копируем кастомные конфиги (или монтируем через volume — см. docker-compose)
# В dev удобнее монтировать, чтобы не пересобирать при изменении конфига
COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80