<?php

namespace Plugins\WhereGroup\ServiceBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\ProfileApplicationMenuListener;

class ApplicationListener extends ProfileApplicationMenuListener
{
    protected $pluginId = 'profile-service';
    protected $name     = 'Dienste';
    protected $bundle   = 'ProfileService';

    public function onLoading(ApplicationEvent $event)
    {
        parent::onLoading($event);

        $app = $event->getApplication();

        if ($app->isBundle($this->bundle) && $app->isAction('edit')) {
            $id = $app->getRequestStack()->getMasterRequest()->get('id');

            $app->add(
                $app->get('PluginMenu', 'map')
                    ->template('ProfileServiceBundle:Export:loadMap.html.twig', array(
                        'url' => 'http://osm-demo.wheregroup.com/service?SERVICE=WMS&Version=1.1.1&REQUEST=getCapabilities'
                    ))
            );
        }
    }
}
