## Pluginentwicklung

Plugins können in einen der Plugin-Ordner erstellt werden, üblicherweise unter `src/Plugins/`. Die Konvention zum erstellen der Ordnerstruktur ist `src/Plugins/<Organisation>/<PluginBundle>`.

### Erstellen der Grundtruktur

Zunächst erstellen wir folgende Ordnerstruktur.

`src/Plugins/WhereGroup/HelloWorldBundle`

Anschließend erstellen wir in dem Ordner die Datei `WhereGroupHelloWorldBundle.php` und fügen folgenden Inhalt hinzu.

```php
<?php
// .../HelloWorldBundle/WhereGroupHelloWorldBundle.php

namespace Plugins\WhereGroup\HelloWorldBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class WhereGroupHelloWorldBundle extends Bundle
{
}
```

Damit hätten wir die minimale Grundstruktur eines Symfony-Bundles erstellt.

### Plugindefinition

Damit unser Bundle als Metador-Plugin erkannt wird müssen wir folgende Plugin-Definitionsdatei erstellen.

```yaml
# .../HelloWorldBundle/Resources/config/plugin.yml
wheregroup-hello-world:
  version: 1.0
  origin: WhereGroup
  name: Hallo Welt
  description: Beispiel Plugin für Metador 2.1
  class_path: User\Plugin\WhereGroup\HelloWorldBundle
  class_name: WhereGroupHelloWorldBundle
```

Nun sollte unser Plugin in der Liste der Plugins auftauchen und installierbar sein.
