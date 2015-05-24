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
    }
}
