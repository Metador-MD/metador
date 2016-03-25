<?php

namespace Plugins\WhereGroup\HelptextBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationMenuListener
{
    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->newAdd(
            $app->getClass('Script')
                ->file('bundles/wheregrouphelptext/helptext.js')
        );
    }
}
