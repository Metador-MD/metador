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
    protected $id;

    public function __construct(MetadataInterface $metadata, ContainerInterface $container)
    {
        $this->metadata  = $metadata;
        $this->container = $container;
        $this->id        = $this->container->get('request')->get('id', 0);

        var_dump($this->id);
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
        $app = $event->getApplication();

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
            'rows'    => $this->metadata->getMetadata(10, 0, self::PROFILE)
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
                    'label'  => 'Übersicht',
                    'icon'   => 'icon-list',
                    'path'   => 'metadata_index',
                    'params' => array('profile' => self::PROFILE)
                ));
            }

            $app->add('app-plugin-menu', 'new', array(
                'label'  => 'neu',
                'icon'   => 'icon-file-empty',
                'path'   => 'metadata_new',
                'params' => array('profile' => self::PROFILE),
                'active' => $app->isAction(array('new', 'use'))
            ));

            if ($app->isAction('edit')) {
                $app->add('app-plugin-menu', 'xml', array(
                    'label'  => 'XML',
                    'icon'   => 'icon-embed',
                    'path'   => 'metador_export_xml',
                    'params' => array('id' => $this->id)
                ));
            }

            // if (!$app->isAction('index')) {
            //     // has access?

            //     $path = 'metadata_new';
            //     $param = array(
            //         'profile' => self::PROFILE
            //     );

            //     if ($app->isAction('edit')) {
            //         $path = 'metadata_edit';
            //         $param = array(
            //             'profile' => self::PROFILE,
            //             'id'      => $this->id
            //         );
            //     }

            //     $app->add('app-plugin-menu', 'save', array(
            //         'label'  => 'speichern',
            //         'path'   => $path,
            //         'params' => $param,
            //         'active' => false
            //     ));
            // }
        }
    }
}
