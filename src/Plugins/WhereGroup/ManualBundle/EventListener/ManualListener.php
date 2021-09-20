<?php

namespace Plugins\WhereGroup\ManualBundle\EventListener;

use Plugins\WhereGroup\ManualBundle\Event\ManualEvent;

/**
 * Class ManualListener
 * @package Plugins\WhereGroup\ManualBundle\EventListener
 */
class ManualListener
{
    /**
     * @param ManualEvent $event
     */
    public function onManualLoading($event)
    {
        $event
            // @codingStandardsIgnoreStart
            ->add('Anwenderhandbuch', 'Allgemein', 'MetadorManual', 'general', null)
            ->add('Anwenderhandbuch', 'Startseite', 'MetadorManual', 'home', null)
            ->add('Anwenderhandbuch', 'Arbeiten mit der Karte', 'MetadorManual', 'map', null)
            ->add('Anwenderhandbuch', 'Nach der Anmeldung', 'MetadorManual', 'after-login', null)
            ->add('Anwenderhandbuch', 'Metadaten', 'MetadorManual', 'metadata', 'ROLE_SYSTEM_USER')
            ->add('Anwenderhandbuch', 'Metadaten - Formulare', 'MetadorManual', 'metadata-form', 'ROLE_SYSTEM_USER')
            ->add('Anwenderhandbuch', 'Metadaten - Hilfetexte', 'MetadorManual', 'metadata-help', 'ROLE_SYSTEM_USER')
            ->add('Anwenderhandbuch', 'Metadaten - Auswahllisten', 'MetadorManual', 'metadata-list', 'ROLE_SYSTEM_USER')
            ->add('Anwenderhandbuch', 'Metadaten - Suche', 'MetadorManual', 'search', null)
            ->add('Administration', 'Allgemein', 'MetadorManual', 'admin', 'ROLE_SYSTEM_GEO_OFFICE')
            ->add('Administration', 'Adressen', 'MetadorManual', 'address', 'ROLE_SYSTEM_GEO_OFFICE')
            ->add('Administration', 'Benutzer/Gruppen', 'MetadorManual', 'user', 'ROLE_SYSTEM_SUPERUSER')
            ->add('Administration', 'Plugins', 'MetadorManual', 'plugin', 'ROLE_SYSTEM_SUPERUSER')
            ->add('Entwicklung', 'Handbucheintrag', 'MetadorManual', 'dev-manual', null, 'dev')
            ->add('Entwicklung', 'Pluginentwicklung', 'MetadorManual', 'dev-plugin', null, 'dev')
            ->add('Entwicklung', 'Profilentwicklung', 'MetadorManual', 'dev-profile', null, 'dev')
            // @codingStandardsIgnoreEnd
        ;
    }
}
