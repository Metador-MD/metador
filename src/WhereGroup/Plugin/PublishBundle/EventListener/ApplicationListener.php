<?php

namespace WhereGroup\Plugin\PublishBundle\EventListener;

use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\PluginBundle\Component\ApplicationIntegration;

/**
 * Class ApplicationListener
 * @package WhereGroup\Plugin\PublishBundle\EventListener
 * @author A.R.Pour
 */
class ApplicationListener extends ApplicationIntegration
{
    protected $app     = null;
    protected $prefix  = 'publish';
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
        $this->app = $event->getApplication();

        $this->app->add('app-profile-table', $this->prefix, array(
            'header' => array(
                'label' => 'veröffentlichen',
                'class' => 'right last-1',
                'icon'  => 'icon-earth'
            ),
            'body' => array(
                'template' => 'WhereGroupPublishBundle::publishColumn.html.twig',
                'params'   => array()
            )
        ));

        $this->addToScripts('bundles/wheregrouppublish/publish.js');

        if ($this->app->isRoute('metador_admin_index')) {
            if (!is_writeable($this->exportPath)) {
                $this->addToWarnings('icon-notification', 'Ordner zum veröffentlichen der Metadaten ist nicht beschreibbar!');
            }
        }
    }
}
