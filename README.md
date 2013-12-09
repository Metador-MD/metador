MeTaDor2
========
Metadata Editor for creating metadata according to the INSPIRE and GDI-DE implementing rules.

Required
------------
* PHP 5.3.10 or later (php5)
* PHP CLI interpreter (php5-cli)
* PHP SQLite extension (php5-sqlite)
* PHP cURL extension (php5-curl)
* PHP Internationalization (php5-intl)

<pre>
# On debian systems...
sudo apt-get install curl sqlite php5 php5-cli php5-sqlite php5-curl php5-intl
</pre>

Installation
------------
<pre>
# Clone MeTaDor2 from repository.
cd srv
git clone https://github.com/WhereGroup/metador2.git

# Create and edit configuration.
cp app/config/parameters.yml.dist app/config/parameters.yml

# Get vendors.
cd metador2
app/scripts/composer-update.sh

# Create database
app/console doctrine:database:create
app/console doctrine:schema:create
app/console assets:install web

chmod o+rw app/cache
chmod o+rw app/logs

# Create Superuser
app/console metador:reset:superuser 
</pre>
