<?php

namespace WhereGroup\Plugin\DatasetBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

class ApplicationMenuListener extends ProfileApplicationMenuListener
{
    protected $profile = 'dataset';
    protected $name    = 'Geodaten';
    protected $bundle  = 'ProfileDataset';

    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);
    }
}
