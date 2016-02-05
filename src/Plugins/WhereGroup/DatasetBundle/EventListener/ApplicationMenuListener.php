<?php

namespace Plugins\WhereGroup\DatasetBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

/**
 * Class ApplicationMenuListener
 * @package Plugins\WhereGroup\DatasetBundle\EventListener
 */
class ApplicationMenuListener extends ProfileApplicationMenuListener
{
    protected $profile = 'dataset';
    protected $name    = 'Geodaten';
    protected $bundle  = 'ProfileDataset';

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);
    }
}
