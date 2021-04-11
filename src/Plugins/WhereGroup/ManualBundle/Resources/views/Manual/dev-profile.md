# Profilentwicklung

Um ein Profil zu erstellen, wird der Plugin-Konfiguration folgendes hinzugefügt.

```yml
    type: profile
    require:
        - metador_basic_profile
    settings:
        source:
            type: multi
            label: Verfügbar in Datenquelle
            description: Einstellen in welcher Datenquelle der Datensatz erstellt werden kann.
            optionSource: source
            default: [default]
```

Hiermit wird das Plugin als Profil markiert, das Basisprofil von Metador wird eingeschaltet und es wird eine Konfiguration für Datenquellen hinzugefügt.

## Formulardefinition

Ein Formular mit seinen Menüpunkten und Tabs wird in folgender Datei definiert.

- <ProfilBundle>/Resources/views/Profile/form.html.twig

## Validierung

Die Validierung für einzelne Formularfelder kann in folgender Datei angepasst oder erstellt werden.

- <ProfilBundle>/Resources/config/validation.json

## Import

Um XML's importieren zu können, müssen diese auf das Metador-Datenobject gemappt werden. Hierzu wird folgende Datei verwendet.

- <ProfilBundle>/Resources/config/import.json

## Export

| Typ | Ort |
| --- | --- |
| XML | Resources/views/Export/metadata.xml.twig |
| PDF | Resources/views/Export/pdf.html.twig |
| HTML | Resources/views/Export/html.html.twig |


