# Installation

```
# Clone MeTaDor2 from repository.
cd /srv
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
```

<a href="../../../README.md">&laquo; back</a>