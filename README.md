# FinWay

Навчальний вебзастосунок з уроками, мінііграми, прогресом та магазином.
HTML/CSS/vanilla JavaScript, PHP 8.3+ (`pdo_mysql`, `mbstring`), MySQL 8.0+, Apache/PHP-FPM. Python 3.10+ для тестів і пакування, Node.js для перевірки синтаксису JS.

## Локальний запуск

Створіть порожню БД і користувача від адміністратора MySQL; замініть пароль прикладу:

```sql
CREATE DATABASE finway_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'finway_app'@'localhost' IDENTIFIED BY 'replace-with-your-local-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON finway_dev.* TO 'finway_app'@'localhost';
```

```sh
mysql -u root -p finway_dev < database/000_schema.sql
mysql -u root -p finway_dev < database/001_seed_catalog.sql
cp config/local.example.json config/local.json
# Відредагуйте локальні ім'я БД, користувача і пароль.
export LCA_CONFIG_FILE="$PWD/config/local.json"
php -S 127.0.0.1:8080 -t . scripts/dev-router.php
```

Відкрийте `http://127.0.0.1:8080/` і зареєструйте тестового користувача. На Windows ці команди можна виконувати у WSL. Вбудований сервер призначений для локальної розробки. Для Docker MySQL задайте db_host=127.0.0.1 і потрібний db_port.

Змінні LCA_DB_HOST, LCA_DB_PORT, LCA_DB_NAME, LCA_DB_USER, LCA_DB_PASS мають пріоритет над приватним JSON. Production-секрет: `/home/base/etc/life-capital-db.json`, всередині FPM chroot `/etc/life-capital-db.json`. Схема/seed не містять реальних користувачів. Не додавайте секрети/дампи у Git.

## Перевірки

Тестовому користувачу потрібні права включно з CREATE/DROP тільки на `finway\_test\_%`.*. Кожен запуск створює/видаляє власну випадкову БД. Production-користувач застосунку для цього не підходить.

```sh
export MYSQL_HOST=127.0.0.1 MYSQL_USER=finway_test
read -rs MYSQL_PWD; export MYSQL_PWD
python3 tests/integration.py
python3 -m unittest discover -s tests -p test_release.py -v
find api scripts -name '*.php' -exec php -l {} \;
find js -name '*.js' -exec node --check {} \;
```

GitHub Actions backend-ci.yml виконує ці перевірки на MySQL 8.0/PHP 8.3. server-release.yml запускає перевірки перед ручним deploy/rollback з main. GitHub Pages — статичний перегляд, PHP API там не виконується.

[API](api/README.md) · [Експлуатація](docs/operations.md) · [Докази для курсової](docs/coursework-evidence.md)

Даніл: інфраструктура/доступ/сесії/захист/deploy/backup. Юрій: інтерфейс та прикладні API. Вадим: UI/UX і правила гри. Вовчик: БД/QA/ігрові системи. Домен поки залишається techlifeacademys.pp.ua; перейменування у FinWay не потребує міграції даних.
