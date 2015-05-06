<?php

namespace WhereGroup\Profile\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    const PROFILE = 'service';

    protected $application;
    protected $metadata;
    protected $container;
    protected $id;

    public function __construct(MetadataInterface $metadata, ContainerInterface $container)
    {
        $this->metadata = $metadata;
        $this->container = $container;
        $this->id = $this->container->get('request')->get('id', 0);
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

        /***********************************************************************
         * Global menu
         ***********************************************************************/
        $this->application->add('app-global-menu', self::PROFILE, array(
            'label'  => 'Dienste',
            'path'   => 'metadata_index',
            'params' => array('profile' => self::PROFILE)
        ));

        /***********************************************************************
         * Dashboard preview
         ***********************************************************************/
        $this->application->add('app-preview', self::PROFILE, array(
            'title'   => 'Dienste',
            'profile' => self::PROFILE,
            'rows'    => $this->metadata->getMetadata(10, 0, self::PROFILE)
        ));

        /***********************************************************************
         * Context menu
         ***********************************************************************/
        if ($this->application->isBundle('ProfileService')) {
            $this->application->add('app-content-menu', 'index', array(
                'label'  => 'Übersicht',
                'path'   => 'metadata_index',
                'params' => array('profile' => self::PROFILE),
                'active' => $this->application->isAction('index')
            ))->add('app-content-menu', 'new', array(
                'label'  => 'neu',
                'path'   => 'metadata_new',
                'params' => array('profile' => self::PROFILE),
                'active' => $this->application->isAction(array('new', 'use'))
            ));

            if ($this->application->isAction('edit')) {
                $this->application->add('app-content-menu', 'edit', array(
                    'label'  => 'bearbeiten',
                    'active' => true
                ));
            }

            if (!$this->application->isAction('index')) {
                // has access?

                $path = 'metadata_new';
                $param = array(
                    'profile' => self::PROFILE
                );

                if ($this->application->isAction('edit')) {
                    $path = 'metadata_edit';
                    $param = array(
                        'profile' => self::PROFILE,
                        'id'      => $this->id
                    );
                }

                $this->application->add('app-content-menu', 'save', array(
                    'label'  => 'speichern',
                    'path'   => $path,
                    'params' => $param,
                    'active' => false
                ));
            }
        }
    }
}
