<?php

namespace WhereGroup\UserBundle\EventListener;

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
         * Admin Menu
         ***********************************************************************/
        $app->add('app-admin-menu', 'user', array(
            'icon'   => 'icon-user',
            'label'  => 'Benutzer',
            'path'   => 'metador_admin_user',
            'params' => array()
        ), 'ROLE_SUPERUSER');

        $app->add('app-admin-menu', 'group', array(
            'icon'   => 'icon-users',
            'label'  => 'Gruppen',
            'path'   => 'metador_admin_group',
            'params' => array()
        ), 'ROLE_SUPERUSER');
    }
}
