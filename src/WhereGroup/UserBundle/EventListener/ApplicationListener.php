<?php

namespace WhereGroup\UserBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

class ApplicationListener
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

        // ADMIN AREA
        if ($app->routeStartsWith('metador_admin')) {
            $app->newAdd(
                $app->getClass('AdminMenu', 'user')
                    ->icon('icon-user')
                    ->label('Benutzer')
                    ->path('metador_admin_user')
                    ->active($app->isController('user'))
                    ->setRole('ROLE_SUPERUSER')
            )->newAdd(
                $app->getClass('AdminMenu', 'group')
                    ->icon('icon-users')
                    ->label('Gruppen')
                    ->path('metador_admin_group')
                    ->active($app->isController('group'))
                    ->setRole('ROLE_SUPERUSER')
            );
        }

        // GROUP CONTROLLER
        if ($app->isBundle('user') && $app->isController('group')) {
            if ($app->isAction('index')) {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'new')
                        ->icon('icon-users')
                        ->label('Neu')
                        ->path('metador_admin_group_new')
                );
            // NOT GORUP INDEX
            } else {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'index')
                        ->icon('icon-redo2')
                        ->label('zurück')
                        ->path('metador_admin_group')
                );
            }

            if ($app->isAction('edit')) {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'delete')
                        ->icon('icon-bin2')
                        ->label('löschen')
                        ->path(
                            'metador_admin_group_confirm',
                            array(
                                'id' => $this
                                    ->requestStack
                                    ->getCurrentRequest()
                                    ->get('id')
                            )
                        )
                );
            }
        }

        // USER CONTROLLER
        if ($app->isBundle('user') && $app->isController('user')) {
            // USER INDEX
            if ($app->isAction('index')) {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'new')
                        ->icon('icon-user')
                        ->label('Neu')
                        ->path('metador_admin_user_new')
                );

            // NOT GORUP INDEX
            } else {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'index')
                        ->icon('icon-redo2')
                        ->label('zurück')
                        ->path('metador_admin_user')
                );
            }

            // USER EDIT
            if ($app->isAction('edit')) {
                $app->newAdd(
                    $app->getClass('PluginMenu', 'delete')
                        ->icon('icon-bin2')
                        ->label('löschen')
                        ->path(
                            'metador_admin_user_confirm',
                            array(
                                'id' => $this
                                    ->requestStack
                                    ->getCurrentRequest()
                                    ->get('id')
                            )
                        )
                );
            }
        }
    }
}
