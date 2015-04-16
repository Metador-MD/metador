<?php

namespace WhereGroup\Profile\ServiceBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationMenuListener
{
    protected $application;

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->application = $event->getApplication();

        $this->application->add('app-global-menu', 'service', array(
            'label'  => 'Geodatendienste',
            'path'   => 'wheregroup_metador_service_index',
            'params' => array()
        ));
    }
}
