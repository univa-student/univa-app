-- docker/development/postgres/init/01_init.sql
-- Скрипт инициализации PostgreSQL.
-- Выполняется автоматически при первом старте контейнера (пустой postgres_data том).
-- Основная БД (app) уже создаётся через POSTGRES_DB в docker-compose.yml.
-- Здесь можно добавить: дополнительные базы, роли, расширения.

-- Пример: включить расширение uuid-ossp для UUID-генерации
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Пример: создать тестовую БД
-- CREATE DATABASE app_test OWNER app;
