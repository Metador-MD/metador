<?php

namespace WhereGroup\UserBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\CoreBundle\Component\MetadataInterface;

class ApplicationMenuListener
{
    protected $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function __destruct()
    {
        unset($this->requestStack);
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

            // USER BUNDLE
            if ($app->isBundle('user')) {
                // GROUP INDEX
                if ($app->isRoute('metador_admin_group')) {
                    $app->add('app-plugin-menu', 'new', array(
                        'label'  => 'Neu',
                        'icon'   => 'icon-users',
                        'path'   => 'metador_admin_group_new',
                        'params' => array(),
                    ));
                // NOT GORUP INDEX
                } else {
                    $app->add('app-plugin-menu', 'index', array(
                        'label'  => 'zurück',
                        'icon'   => 'icon-redo2',
                        'path'   => 'metador_admin_group',
                        'params' => array()
                    ));
                }

                // GROUP EDIT
                if ($app->isController('group') && $app->isAction('edit')) {
                    $app->add('app-plugin-menu', 'delete', array(
                        'label'  => 'löschen',
                        'icon'   => 'icon-bin2',
                        'path'   => 'metador_admin_group_confirm',
                        'params' => array(
                            'id' => $this->requestStack->getCurrentRequest()->get('id')
                        ),
                    ));
                }
            }
        }
    }
}
