<?php

namespace WhereGroup\CoreBundle\EventListener;

use Plugins\WhereGroup\ManualBundle\Event\ManualEvent;

class ManualListener
{
    /**
     * @param ManualEvent $event
     */
    public function onManualLoading($event)
    {
        $event
            // @codingStandardsIgnoreStart
            ->add('Administration', 'Adressen', 'MetadorCore', 'address', 'ROLE_SYSTEM_GEO_OFFICE')
            // @codingStandardsIgnoreEnd
        ;
    }
}
