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
    }
}
