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

        if ($app->routeStartsWith('metador_admin')) {
            $app->add('app-admin-menu', 'user', array(
                'icon'   => 'icon-user',
                'label'  => 'Benutzer',
                'path'   => 'metador_admin_user',
                'params' => array(),
                'active' => $app->isController('user')
            ), 'ROLE_SUPERUSER');

            $app->add('app-admin-menu', 'group', array(
                'icon'   => 'icon-users',
                'label'  => 'Gruppen',
                'path'   => 'metador_admin_group',
                'params' => array(),
                'active' => $app->isController('group')
            ), 'ROLE_SUPERUSER');

            if ($app->isBundle('user')) {
                if ($app->isRoute('metador_admin_group')) {
                    $app->add('app-plugin-menu', 'new', array(
                        'label'  => 'Neu',
                        'icon'   => 'icon-users',
                        'path'   => 'metador_admin_group_new',
                        'params' => array(),
                    ));
                }

                if ($app->isController('group') && $app->isAction('edit')) {
                    $app->add('app-plugin-menu', 'delete', array(
                        'label'  => 'löschen',
                        'icon'   => 'icon-bin2',
                        'path'   => 'metador_admin_group_confirm',
                        'params' => array(),
                    ));
                }
            }
        }
    }
}
