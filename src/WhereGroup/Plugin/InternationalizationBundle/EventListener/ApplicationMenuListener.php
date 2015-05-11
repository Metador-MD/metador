<?php

namespace WhereGroup\Plugin\InternationalizationBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{

    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();
    }
}
