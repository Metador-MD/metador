<?php

namespace WhereGroup\UserBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use WhereGroup\CoreBundle\Event\ApplicationEvent;

/**
 * Class ApplicationListener
 * @package WhereGroup\UserBundle\EventListener
 */
class ApplicationListener
{
    protected $requestStack;

    /**
     * ApplicationListener constructor.
     * @param RequestStack $requestStack
     */
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
            $app->add(
                $app->get('AdminMenu', 'user')
                    ->icon('icon-user')
                    ->label('Benutzer')
                    ->path('metador_admin_user')
                    ->active($app->isController('user'))
                    ->setRole('ROLE_SYSTEM_SUPERUSER')
            )->add(
                $app->get('AdminMenu', 'group')
                    ->icon('icon-users')
                    ->label('Gruppen')
                    ->path('metador_admin_group')
                    ->active($app->isController('group'))
                    ->setRole('ROLE_SYSTEM_SUPERUSER')
            );
        }

        // GROUP CONTROLLER
        if ($app->isBundle('user') && $app->isController('group')) {
            if ($app->isAction('index')) {
                $app->add(
                    $app->get('PluginMenu', 'new')
                        ->icon('icon-users')
                        ->label('Neu')
                        ->path('metador_admin_group_new')
                );
            // NOT GORUP INDEX
            } else {
                $app->add(
                    $app->get('PluginMenu', 'index')
                        ->icon('icon-redo2')
                        ->label('zurück')
                        ->path('metador_admin_group')
                );
            }

            if ($app->isAction('edit')) {
                $app->add(
                    $app->get('PluginMenu', 'delete')
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
                $app->add(
                    $app->get('PluginMenu', 'new')
                        ->icon('icon-user')
                        ->label('Neu')
                        ->path('metador_admin_user_new')
                );

            // NOT GORUP INDEX
            } else {
                $app->add(
                    $app->get('PluginMenu', 'index')
                        ->icon('icon-redo2')
                        ->label('zurück')
                        ->path('metador_admin_user')
                );
            }

            // USER EDIT
            if ($app->isAction('edit')) {
                $app->add(
                    $app->get('PluginMenu', 'delete')
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
