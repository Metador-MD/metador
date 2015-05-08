<?php

namespace WhereGroup\Plugin\DatasetBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    const PROFILE = 'dataset';
    const NAME    = 'Geodaten';

    protected $metadata;
    protected $container;
    protected $id;

    public function __construct(MetadataInterface $metadata, ContainerInterface $container)
    {
        $this->metadata  = $metadata;
        $this->container = $container;
        $this->id        = $this->container->get('request')->get('id', 0);
    }

    public function __destruct()
    {
        unset($this->metadata, $this->container);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app      = $event->getApplication();
        $metadata = $this->metadata->getMetadata(10, 1, self::PROFILE);

        /***********************************************************************
         * Profile Name
         ***********************************************************************/
        if ($app->isBundle('ProfileDataset')) {
            $app->add('app-profile', 'profile', array(
                'name'   => self::NAME,
                'active' => $app->isController('Profile')
            ));
        }

        /***********************************************************************
         * Dashboard preview
         ***********************************************************************/
        $app->add('app-preview', self::PROFILE, array(
            'title'   => self::NAME,
            'profile' => self::PROFILE,
            'rows'    => $metadata['result']
        ));

        /***********************************************************************
         * Profile Menu
         ***********************************************************************/
        $app->add('app-profile-menu', self::PROFILE, array(
            'label'  => self::NAME,
            'path'   => 'metadata_index',
            'params' => array('profile' => self::PROFILE)
        ));

    }
}
