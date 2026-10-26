# FinWay: експлуатація

## Production

Сайт `/home/base/sites/techlifeacademys.pp.ua`, Apache `httpd`, PHP `php85w-fpm@techlifeacademys.pp.ua`, chroot `/home/base`. БД life_capital, користувач life_capital_app; секрет `/home/base/etc/life-capital-db.json`, root:base 0640.

Код після deploy root:base, файли 0644, каталоги 0755; PHP не може змінювати код. Rate limit зберігається в приватному tmp chroot. `/api/health.php` — liveness без БД, `/api/ready.php` — з'єднання, таблиця users та версія релізу; відмова дає 503 без деталей підключення. API повертає X-Request-ID, для 5xx логує ID/статус/шлях без query/body/паролів. Apache access log містить URL: секрети не передаються в query string.

## Cloudflare/мережа

Root і www A проксовані; SSL Full (strict), TLS 1.2+, HTTPS. www перенаправляє на основний HTTPS зі збереженням шляху. remoteip.conf довіряє CF-Connecting-IP тільки з мереж Cloudflare. Snapshot `infra/cloudflare-ips.json` отриманий через API /ips 2026-10-26. При оновленні згенеруйте `python3 scripts/render_ingress.py <output>`, перевірте `httpd -t`/`nft -c -f ...`, застосуйте обидва файли й повторіть перевірки.

finway-web-ingress.service керує тільки власною nftables-таблицею: 80/443 для CF, localhost, LAN 192.168.31.0/24 та WireGuard 10.10.0.0/24; панель 8000/8002 тільки для локальних мереж. Правила БД/Fail2ban/WireGuard збережені. Не запускайте глобальний flush ruleset.

certbot.timer поновлює TLS через webroot challenge/Cloudflare. Після змін DNS/WAF/редиректів: `certbot renew --dry-run --run-deploy-hooks`.

## Deploy/rollback

```sh
python3 scripts/build_release.py build/finway.tar.gz
ssh -i ~/.ssh/finway_deploy_ed25519 finway-deploy@192.168.31.219 deploy < build/finway.tar.gz
ssh -i ~/.ssh/finway_deploy_ed25519 finway-deploy@192.168.31.219 rollback
```

Пакуйте після commit і тестів. Окремий ключ у WSL ~/.ssh/finway_deploy_ed25519 має права 0600. Користувач має forced command deploy/rollback, без shell/PTY/forwarding. Root helper `/usr/local/sbin/finway-release`, конфіг `/etc/finway/deploy.json`, стан/попередні версії `/var/lib/finway-deploy` 0700. Встановлення адміністратором: `scripts/server/install-deploy.py <public-key-file>`.

Пакет містить дозволені публічні файли. Helper обмежує розміри/кількість, відхиляє traversal/links/дублікати/службові файли, блокує одночасний deploy. Reload FPM і прямий HTTPS readiness з перевіркою сертифіката/версії визначають успіх; при відмові повертається старий каталог. Rollback змінює тільки файли. SQL-міграції/секрети/дані користувачів не входять у реліз. Між двома rename можлива коротка недоступність.

На новому сервері перевірте однакову файлову систему DocumentRoot/state і readiness попередньої версії до першого deploy. Схему/seed імпортують тільки у нову порожню БД. Старі релізи зберігаються для аналізу; стежте за диском і видаляйте тільки перевірені каталоги, які не є DocumentRoot або previous.json.directory.

Перевірка батьківських прав: `namei -l /home/base/sites/techlifeacademys.pp.ua`. Усі батьківські каталоги мають належати root і не бути доступними PHP-користувачу для запису. На поточному сервері /home/base=root:root 0755, /home/base/sites=root:base 0755. Installer не призначений для довільних layout без цієї перевірки.

GitHub environment production потребує FINWAY_DEPLOY_HOST, FINWAY_DEPLOY_PORT, FINWAY_DEPLOY_KEY, FINWAY_KNOWN_HOSTS. Known hosts отримують через довірений LAN/root-доступ з перевіркою fingerprint. Не вимикайте StrictHostKeyChecking. GitHub runner потребує доступу до SSH: LAN 192.168.31.219 недоступний GitHub-hosted runner. Використовуйте налаштований публічний SSH endpoint або окремий довірений runner; не запускайте PR-runner на production. Локальний контрольований SSH deploy працює незалежно від GitHub secrets.

## Перевірки/backup/recovery

```sh
/usr/local/sbin/application-server-check
python3 scripts/server/check-origin.py
systemctl status application-server-backup.timer certbot.timer finway-web-ingress
journalctl -u httpd -u php85w-fpm@techlifeacademys.pp.ua --since '1 hour ago'
```

Backup щодня о 04:30 Europe/Kyiv + випадкова затримка до 10 хв. `/var/backups/application-server/<UTC>`: MySQL/PostgreSQL, сайт, конфігурація, firewall і SHA256SUMS; локальне зберігання 14 діб. Це локальні копії; зовнішнє сховище потребує вибору місця й доступу. Maintenance snapshots приватні, поза Git.

Ручний запуск: `systemctl start application-server-backup.service`. Перевірте Result=success, SHA256SUMS і диск. `python3 scripts/server/test-recovery.py` відновлює свіжий дамп FinWay у нову випадкову БД, перевіряє читання 17 таблиць і видаляє лише її, без друку даних.

При аварії збережіть поточний стан. Для помилки коду — rollback. Для втрати БД спочатку перевірте SHA256SUMS і відновіть копію в ізольований MySQL, перевірте дані/API; переключайте production після оцінки втрати нових записів. Не імпортуйте all-databases поверх працюючої системи. Конфіг/сертифікати відновлюйте з правами, перевіряйте sshd -t/httpd -t/nft syntax до reload. Root SSH-ключ через LAN/WireGuard залишається аварійним доступом.

Snapshot до робіт: `/root/codex-maintenance/coursework-20261026T154906Z`.
