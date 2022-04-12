# Installation
Systemvoraussetzungen:
- PHP >= 7.1
- Apache 2.4
- PostgreSQL

## Linux/Debian
```
sudo apt install php libapache2-mod-php
sudo apt install php-gd php-curl php-cli php-xml php-apcu php-intl openssl php-zip php-mbstring php-bz2 php-pgsql
```
### Metador Installation
```
wget https://github.com/Metador-MD/metador/archive/refs/heads/develop.zip -O /var/www/metador-develop.zip
mv $(ls -d /var/www/*/ | grep metador) /var/www/metador/
cd /var/www/metador/
```
### Abhängigkeiten mit Composer installieren und Metador-Parameter setzen

#### Composer installieren
```
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === '906a84df04cea2aa72f40b5f787e49f22d4c2f19492ac310e8cba5b96ac8b64115ac402c8cd292b8a03482574915d1a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```
#### Abhängigkeiten installieren und Parameter setzen (Beispiel-Parameter)
```
./composer.phar install -o
```
```
database_driver (pdo_sqlite): pdo_pgsql
database_host (null): localhost
database_port (null): 5432
database_name (null): metador
database_user (null): user
database_password (null): password
database_path ('%kernel.root_dir%/../var/metador.db3'): null
mailer_transport (smtp):
mailer_host (127.0.0.1):
mailer_user (null):
mailer_password (null):
secret (ThisTokenIsNotSoSecretChangeIt):
locale (de):
api_access_ips ({  }):
csw_access_ips ({  }):
cache_enabled (false):
```

Alle Parameters sind danach in der Datei ./app/config/parameters.yml zu finden.

Rechte für Apache setzen:
```
chown -R www-data:www-data /var/www/metador
```
#### Metador Datenbank erstellen

Datenbank erstellen:
```
php bin/console doctrine:database:create
php bin/console doctrine:schema:create
php bin/console metador:init:database
```
Passwort ändern:
```
php bin/console metador:reset:superuser --password=MYPASS
```
Assets setzen:
```
php bin/console assets:install web --symlink --relative
```
### Apache-Konfiguration

Datei /etc/apache2/sites-available/metador.conf mit dem folgenden Inhalt anlegen:

```
Alias /metador /var/www/metador/web/
<Directory /var/www/metador/web/>
Options MultiViews FollowSymLinks
DirectoryIndex app.php
Require all granted

RewriteEngine On
RewriteBase /metador/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ app.php [QSA,L]
</Directory>
```
Webseite aktivieren und Apache neu starten:
```
a2ensite metador.conf
service apache2 reload
```

###Metador aufrufen:
```
http://[hostname]/metador/
```
###Plugins aktivieren:
Metador aufrufen:
```
http://[hostname]/metador/
```
Nach der Anmeldung "Administration->Plugins" aufrufen und gewünschte Plugins aktivieren

