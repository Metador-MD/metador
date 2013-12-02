Konfiguration
=============
(1) AppKernel erweitern
------------------------
<code>
vim <metador folder>/app/AppKernel.php
</code>

Folgende Zeile einfügen:

<code>
new WhereGroup\ExportBundle\WhereGroupExportBundle(),
</code>

(2) parameter.yml erweitern
---------------------------
<code>
    metador:
        export:
            path: /tmp/metadata
</code>