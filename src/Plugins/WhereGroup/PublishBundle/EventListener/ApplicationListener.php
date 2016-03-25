<?php

namespace Plugins\WhereGroup\PublishBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package Plugins\WhereGroup\PublishBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener
{
    protected $exportPath = null;

    /**
     * @param $exportPath
     */
    public function __construct($exportPath)
    {
        $this->exportPath = rtrim($exportPath, '/') . '/';
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        $app->newAdd(
            $app->getClass('ProfileTable', 'publish')
                ->headerLabel('veröffentlichen')
                ->headerClass('right last-1')
                ->headerIcon('icon-earth')
                ->bodyTemplate('WhereGroupPublishBundle::publishColumn.html.twig')
        )->newAdd(
            $app->getClass('Script')
                ->file('bundles/wheregrouppublish/publish.js')
        );

        if ($app->isRoute('metador_admin_index')) {
            if (!is_writeable($this->exportPath)) {
                $app->newAdd(
                    $app->getClass('AppInformation')
                        ->warning('Ordner zum veröffentlichen der Metadaten ist nicht beschreibbar!')
                );
            }
        }
    }
}
