<?php

namespace WhereGroup\Profile\DataBundle\EventListener;

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

        $this->application->add('app-global-menu', 'data', array(
            'label'  => 'Geodaten',
            'path'   => 'wheregroup_metador_data_index',
            'params' => array()
        ));
    }
}
