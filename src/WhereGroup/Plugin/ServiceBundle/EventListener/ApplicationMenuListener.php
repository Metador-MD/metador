<?php

namespace WhereGroup\Plugin\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

class ApplicationMenuListener extends ProfileApplicationMenuListener
{
    protected $profile = 'service';
    protected $name    = 'Dienste';
    protected $bundle  = 'ProfileService';

    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);
    }
}
