<?php

namespace WhereGroup\UserBundle\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use WhereGroup\CoreBundle\Event\ApplicationEvent;
use WhereGroup\UserBundle\Component\UserInterface;

/**
 * Class ApplicationListener
 * @package WhereGroup\UserBundle\EventListener
 */
class ApplicationListener
{
    protected $requestStack;
    protected $user;

    /**
     * ApplicationListener constructor.
     * @param RequestStack $requestStack
     * @param UserInterface $user
     */
    public function __construct(RequestStack $requestStack, UserInterface $user)
    {
        $this->requestStack = $requestStack;
        $this->user = $user;
    }

    public function __destruct()
    {
        unset(
            $this->requestStack,
            $this->user
        );
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

            if ($app->isRoute('metador_admin_index')) {
                $app->add(
                    $app->get('AppInformation', 'user-info')
                        ->icon('icon-user')
                        ->label('Benutzer')
                        ->count($this->user->count())
                        ->setRole('ROLE_SYSTEM_SUPERUSER')
                )->add(
                    $app->get('AppInformation', 'group-info')
                        ->icon('icon-users')
                        ->label('Gruppen')
                        ->count($this->user->countGroups())
                        ->setRole('ROLE_SYSTEM_SUPERUSER')
                );
            }
        }
    }
}
