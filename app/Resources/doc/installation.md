# Installation

```
# Clone MeTaDor2 from repository.
cd /srv
git clone https://github.com/WhereGroup/metador2.git

# Create and edit configuration.
cd metador2
cp app/config/parameters.yml.dist app/config/parameters.yml

# Get vendors.
app/Resources/scripts/composer-update.sh

# Create database
app/console doctrine:database:create
app/console doctrine:schema:create
app/console assets:install web

# The webserver user has to have write access to the following directories
# see comments below
chmod o+rw var
chmod o+rw src/plugins

# Create Superuser
app/console metador:reset:superuser 

#Create plugins_routing.yml
touch var/plugins/plugins_routing.yml


# ----------------------------------------------------------------------

# Comment on directory-rights: An alternative of the chmod o+rw command may
# be (on Ubuntu systems):
chown -R www-data:www-data var
chown -R www-data:www-data src/plugins

```

<a href="../../../README.md">&laquo; back</a>
