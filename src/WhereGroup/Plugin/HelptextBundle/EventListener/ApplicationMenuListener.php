<?php

namespace WhereGroup\Plugin\HelptextBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;

class ApplicationMenuListener extends ApplicationIntegration
{
    protected $app     = null;
    protected $prefix  = 'helptext';

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->app = $event->getApplication();

        $this->addToScripts('bundles/wheregrouphelptext/helptext.js');
    }
}
