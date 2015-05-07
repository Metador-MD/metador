
Schlüsselwort Quellen (Keyword Repositories)
============================================
Weitere "Keyword Repositories" können unter "CoreBundle/Data/keywords/" eingefügt werden.

In "all" befinden sich die Quellen für alle Metadaten. In "service" die Quellen für die Dienste. Und in "dataset" die Quellen für Daten und Datensatzreihen.

Schlüssenwort Quelldateien liegen im JSON-Dateiformat vor und richten sich an folgende Struktur.

<code>
{
    "<title>": {
        "date": "<date>",
        "type": "<type>",
        "value": [
            "<keywort value 1>",
            "<keywort value 2>",
            "<keywort value n>"
        ]
    }
}
</code>
