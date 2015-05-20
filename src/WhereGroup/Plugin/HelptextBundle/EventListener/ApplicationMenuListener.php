<?php

namespace WhereGroup\Plugin\HelptextBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        /***********************************************************************
         * JAVASCRIPT
         ***********************************************************************/
        $app->add('app-javascript', 'helptext', array(
            'src' => 'bundles/wheregrouphelptext/helptext.js'
        ));
    }
}
