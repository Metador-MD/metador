<?php

namespace Plugins\WhereGroup\DatasetBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

class ApplicationListener extends ProfileApplicationMenuListener
{
    protected $pluginId = 'profile-dataset';
    protected $name     = 'Geodaten';

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);
    }
}
