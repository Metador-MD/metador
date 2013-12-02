MeTaDor2
========
Metadata Editor for creating metadata according to the INSPIRE and GDI-DE implementing rules.

Installation
------------
<pre>
cd srv
git clone https://github.com/WhereGroup/metador2.git

cd metador2
app/scripts/composer-update.sh

# Add database information to app/conf/parameters.yml
app/console doctrine:database:create
app/console doctrine:schema:create
app/console assets:install web

chmod o+rw app/cache
chmod o+rw app/logs
</pre>
