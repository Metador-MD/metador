<?php

namespace Plugins\WhereGroup\HelptextBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->add(
            $app->get('Script')
                ->file('bundles/wheregrouphelptext/helptext.js')
        );
    }
}
