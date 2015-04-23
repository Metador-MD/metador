<?php

namespace WhereGroup\Profile\DatasetBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\MetadorBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    const PROFILE = 'dataset';

    protected $application;
    protected $metadata;

    public function __construct(MetadataInterface $metadata)
    {
        $this->metadata = $metadata;
    }

    public function __destruct()
    {
        unset($this->metadata);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $this->application = $event->getApplication();

        $this->application->add('app-global-menu', self::PROFILE, array(
            'label'  => 'Geodaten',
            'path'   => 'metadata_index',
            'params' => array('profile' => self::PROFILE)
        ));

        $this->application->add('app-preview', self::PROFILE, array(
            'title'   => 'Daten',
            'profile' => self::PROFILE,
            'rows'    => $this->metadata->getMetadata(10, 0, self::PROFILE)
        ));
    }
}
