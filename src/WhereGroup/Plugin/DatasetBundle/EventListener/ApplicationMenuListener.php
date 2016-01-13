<?php

namespace WhereGroup\Plugin\DatasetBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

/**
 * Class ApplicationMenuListener
 * @package WhereGroup\Plugin\DatasetBundle\EventListener
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
