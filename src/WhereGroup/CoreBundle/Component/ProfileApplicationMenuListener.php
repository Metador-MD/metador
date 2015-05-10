<?php

namespace WhereGroup\CoreBundle\Component;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

abstract class ProfileApplicationMenuListener
{
    protected $metadata;

    public function __construct(MetadataInterface $metadata)
    {
        $this->metadata  = $metadata;
    }

    public function __destruct()
    {
        unset($this->metadata);
    }

    public function onLoading(ApplicationEvent $event)
    {
        $app      = $event->getApplication();

        /***********************************************************************
         * Profile Menu
         ***********************************************************************/
        $app->add('app-profile-menu', $this->profile, array(
            'label'  => $this->name,
            'path'   => 'metadata_index',
            'params' => array('profile' => $this->profile)
        ));

        /***********************************************************************
         * Dashboard preview
         ***********************************************************************/
        if ($app->isController('dashboard')) {
            $metadata = $this->metadata->getMetadata(10, 1, $this->profile);

            $app->add('app-preview', $this->profile, array(
                'title'   => $this->name,
                'profile' => $this->profile,
                'rows'    => $metadata['result']
            ));
        }

        if ($app->isBundle($this->bundle)) {
        /***********************************************************************
         * Profile Name
         ***********************************************************************/
            $app->add('app-profile', 'profile', array(
                'name'   => $this->name,
                'active' => $app->isController('Profile')
            ));

        /***********************************************************************
         * Plugin menu
         ***********************************************************************/
            if ($app->isAction('index')) {
                $app->add('app-plugin-menu', 'new', array(
                    'label'  => 'neu',
                    'icon'   => 'icon-plus',
                    'path'   => 'metadata_new',
                    'params' => array('profile' => $this->profile),
                    'active' => $app->isAction(array('new', 'use'))
                ));
            } else {
                $app->add('app-plugin-menu', 'index', array(
                    'label'  => 'zurück',
                    'icon'   => 'icon-redo2',
                    'path'   => 'metadata_index',
                    'params' => array('profile' => $this->profile)
                ));
            }

            if ($app->isAction('edit')) {
                $id = $app->getParameter('id', 0);

                $app->add('app-plugin-menu', 'xml', array(
                    'label'  => 'XML',
                    'icon'   => 'icon-download',
                    'path'   => 'metador_export_xml',
                    'params' => array('id' => $id),
                    'target' => '_BLANK'
                ));

                $app->add('app-plugin-menu', 'confirm', array(
                    'label'  => 'löschen',
                    'icon'   => 'icon-bin2',
                    'path'   => 'metadata_confirm',
                    'params' => array('profile' => $this->profile, 'id' => $id)
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
