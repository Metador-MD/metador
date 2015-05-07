<?php

namespace WhereGroup\CoreBundle\EventListener;

use Symfony\Component\DependencyInjection\ContainerInterface;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function __destruct()
    {
        unset($this->container);
    }

    /**
     * @param ApplicationEvent $event
     */
    public function onLoading(ApplicationEvent $event)
    {
        $app = $event->getApplication();

        /***********************************************************************
         * Dashboard
         ***********************************************************************/
        $app->add('app-global-menu', 'dashboard', array(
            'icon'   => 'icon-meter',
            'label'  => 'Dashboard',
            'path'   => 'metador_dashboard',
            'params' => array()
        ));

        /***********************************************************************
         * Global Menu
         ***********************************************************************/
        $app->add('app-global-menu', 'admin', array(
            'icon'   => 'icon-cog',
            'label'  => 'Administration',
            'path'   => 'user',
            'params' => array()
        ), 'ROLE_SUPERUSER');
    }
}
