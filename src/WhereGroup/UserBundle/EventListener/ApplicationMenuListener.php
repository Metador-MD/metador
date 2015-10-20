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

        $app->add('app-global-menu', 'profile', array(
            'icon'   => 'icon-user',
            'label'  => 'Benutzerprofil',
            'path'   => 'metador_profile_index',
            'params' => array()
        ));


        // ADMIN AREA
        if ($app->routeStartsWith('metador_admin')) {
            // USER MENU
            $app->add('app-admin-menu', 'user', array(
                'icon'   => 'icon-user',
                'label'  => 'Benutzer',
                'path'   => 'metador_admin_user',
                'params' => array(),
                'active' => $app->isController('user')
            ), 'ROLE_SUPERUSER');

            // GROUP MENU
            $app->add('app-admin-menu', 'group', array(
                'icon'   => 'icon-users',
                'label'  => 'Gruppen',
                'path'   => 'metador_admin_group',
                'params' => array(),
                'active' => $app->isController('group')
            ), 'ROLE_SUPERUSER');

            // GROUP CONTROLLER
            if ($app->isBundle('user') && $app->isController('group')) {
                // GROUP INDEX
                if ($app->isAction('index')) {
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
                if ($app->isAction('edit')) {
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

            // USER CONTROLLER
            if ($app->isBundle('user') && $app->isController('user')) {
                // USER INDEX
                if ($app->isAction('index')) {
                    $app->add('app-plugin-menu', 'new', array(
                        'label'  => 'Neu',
                        'icon'   => 'icon-users',
                        'path'   => 'metador_admin_user_new',
                        'params' => array(),
                    ));
                // NOT GORUP INDEX
                } else {
                    $app->add('app-plugin-menu', 'index', array(
                        'label'  => 'zurück',
                        'icon'   => 'icon-redo2',
                        'path'   => 'metador_admin_user',
                        'params' => array()
                    ));
                }

                // USER EDIT
                if ($app->isAction('edit')) {
                    $app->add('app-plugin-menu', 'delete', array(
                        'label'  => 'löschen',
                        'icon'   => 'icon-bin2',
                        'path'   => 'metador_admin_user_confirm',
                        'params' => array(
                            'id' => $this->requestStack->getCurrentRequest()->get('id')
                        ),
                    ));
                }
            }
        }
    }
}
