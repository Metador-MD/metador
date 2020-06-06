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
            ->add('Anwenderhandbuch', 'Allgemeines', 'MetadorManual', 'general', null)
            ->add('Anwenderhandbuch', 'Metadaten', 'MetadorManual', 'metadata', 'ROLE_SYSTEM_USER')
            ->add('Administration', 'Benutzer/Gruppen', 'MetadorManual', 'user', 'ROLE_SYSTEM_SUPERUSER')
            ->add('Administration', 'Plugins', 'MetadorManual', 'plugin', 'ROLE_SYSTEM_SUPERUSER')
            ->add('Entwicklung', 'Handbucheintrag', 'MetadorManual', 'manual', null, 'dev')
            // @codingStandardsIgnoreEnd
        ;
    }
}
