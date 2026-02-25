# Makefile
# GNU Make 4.x+ совместимый
# Все команды предваряются @ чтобы не дублировать их в выводе

# ─── Переменные ───────────────────────────────────────────────────────────────
DC        := docker compose        # Алиас (compose v2, встроен в Docker)
DC_FILE   := docker-compose.yml
PHP_CLI   := $(DC) exec php-cli    # Префикс для выполнения команд в php-cli
NODE      := $(DC) exec node       # Префикс для node-команд

# Цвета для красивого вывода
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

.PHONY: help up down build rebuild shell-php shell-node shell-nginx \
        logs logs-nginx logs-php logs-node ps \
        composer artisan migrate fresh npm

# ─── HELP (по умолчанию) ──────────────────────────────────────────────────────
help: ## Показать список команд
	@echo ""
	@echo "$(GREEN)🐳 Gateway Dev Environment$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ─── ОСНОВНЫЕ КОМАНДЫ ─────────────────────────────────────────────────────────
up: ## Запустить все контейнеры (в фоне)
	@echo "$(GREEN)▶ Starting containers...$(RESET)"
	@$(DC) -f $(DC_FILE) up -d --remove-orphans
	@echo "$(GREEN)✅ Done! http://localhost$(RESET)"

down: ## Остановить и удалить контейнеры (тома НЕ удаляются)
	@echo "$(YELLOW)⏹ Stopping containers...$(RESET)"
	@$(DC) -f $(DC_FILE) down

down-v: ## Остановить и удалить контейнеры + тома (ДАННЫЕ УДАЛЯТСЯ!)
	@echo "$(YELLOW)⚠ Removing containers and volumes...$(RESET)"
	@$(DC) -f $(DC_FILE) down -v

build: ## Собрать образы (без кеша)
	@echo "$(GREEN)🔨 Building images...$(RESET)"
	@$(DC) -f $(DC_FILE) build --no-cache

rebuild: down build up ## Полный цикл: down → build → up

ps: ## Статус контейнеров
	@$(DC) -f $(DC_FILE) ps

# ─── SHELL ────────────────────────────────────────────────────────────────────
shell-php: ## Войти в bash php-cli контейнера (для artisan, composer, etc.)
	@$(DC) -f $(DC_FILE) exec php-cli sh

shell-node: ## Войти в sh node-контейнера (для npm команд)
	@$(DC) -f $(DC_FILE) exec node sh

shell-nginx: ## Войти в sh nginx-контейнера (для проверки конфигов)
	@$(DC) -f $(DC_FILE) exec nginx sh

shell-db: ## Подключиться к PostgreSQL через psql
	@$(DC) -f $(DC_FILE) exec postgres psql -U $${DB_USERNAME:-app} $${DB_DATABASE:-app}

# ─── ЛОГИ ─────────────────────────────────────────────────────────────────────
logs: ## Хвост логов всех контейнеров
	@$(DC) -f $(DC_FILE) logs -f --tail=100

logs-nginx: ## Логи nginx
	@$(DC) -f $(DC_FILE) logs -f --tail=100 nginx

logs-php: ## Логи php-fpm
	@$(DC) -f $(DC_FILE) logs -f --tail=100 php-fpm

logs-node: ## Логи node (Vite)
	@$(DC) -f $(DC_FILE) logs -f --tail=100 node

# ─── PHP / LARAVEL HELPER-КОМАНДЫ ─────────────────────────────────────────────
composer: ## Запустить composer команду: make composer CMD="install"
	@$(PHP_CLI) composer $(CMD)

artisan: ## Запустить artisan: make artisan CMD="route:list"
	@$(PHP_CLI) php artisan $(CMD)

migrate: ## Применить миграции Laravel
	@$(PHP_CLI) php artisan migrate

fresh: ## Пересоздать БД с нуля (ДАННЫЕ УДАЛЯТСЯ!)
	@$(PHP_CLI) php artisan migrate:fresh --seed

# ─── NODE / VITE ──────────────────────────────────────────────────────────────
npm: ## Запустить npm-команду: make npm CMD="install axios"
	@$(NODE) npm $(CMD)

npm-install: ## Установить node-зависимости
	@$(NODE) npm install