<?php

namespace WhereGroup\Profile\DatasetBundle\EventListener;

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

        $this->application->add('app-global-menu', 'dataset', array(
            'label'  => 'Geodaten',
            'path'   => 'metadata_index',
            'params' => array('profile' => 'dataset')
        ));

        $this->application->add('app-preview', 'dataset', array(
            'title'   => 'Daten',
            'profile' => 'dataset',
            'rows'    => array() // Hier daten auslesen und anzeigen.
        ));
    }
}
