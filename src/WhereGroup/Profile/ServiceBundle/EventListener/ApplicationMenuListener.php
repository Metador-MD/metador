<?php

namespace WhereGroup\Profile\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    const PROFILE = 'service';
    const NAME    = 'Dienste';

    protected $metadata;
    protected $container;

    public function __construct(MetadataInterface $metadata, ContainerInterface $container)
    {
        $this->metadata  = $metadata;
        $this->container = $container;
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
        $id       = $app->getParameter('id', 0);
        $metadata = $this->metadata->getMetadata(10, 1, self::PROFILE);

        /***********************************************************************
         * Profile Name
         ***********************************************************************/
        if ($app->isBundle('ProfileService')) {
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

        /***********************************************************************
         * Context menu
         ***********************************************************************/
        if ($app->isBundle('ProfileService')) {
            if (!$app->isAction('index')) {
                $app->add('app-plugin-menu', 'index', array(
                    'label'  => 'zurück',
                    'icon'   => 'icon-redo2',
                    'path'   => 'metadata_index',
                    'params' => array('profile' => self::PROFILE)
                ));
            }

            if ($app->isAction('index')) {
                $app->add('app-plugin-menu', 'new', array(
                    'label'  => 'neu',
                    'icon'   => 'icon-plus',
                    'path'   => 'metadata_new',
                    'params' => array('profile' => self::PROFILE),
                    'active' => $app->isAction(array('new', 'use'))
                ));
            }

            if ($app->isAction('edit')) {
                $app->add('app-plugin-menu', 'xml', array(
                    'label'  => 'XML',
                    'icon'   => 'icon-download',
                    'path'   => 'metador_export_xml',
                    'params' => array('id' => $id)
                ));

                $app->add('app-plugin-menu', 'delete', array(
                    'label'  => 'löschen',
                    'icon'   => 'icon-bin2',
                    'path'   => 'metador_export_xml',
                    'params' => array('id' => $id)
                ));
            }

            if ($app->isAction('new') || $app->isAction('edit')) {
                $app->add('app-plugin-menu', 'save', array(
                    'label'  => 'speichern',
                    'icon'   => 'icon-floppy-disk'
                ));
            }

        }
    }
}
