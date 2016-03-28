<?php

namespace Plugins\WhereGroup\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

class ApplicationListener extends ProfileApplicationMenuListener
{
    protected $pluginId = 'profile-service';
    protected $name     = 'Dienste';
    protected $bundle   = 'ProfileService';

    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);
    }
}
